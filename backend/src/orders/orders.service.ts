import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import type { DrizzleDB } from '../database/database.module';
import { ordersTable, orderItemsTable } from './entities/order.schema';
import * as itemSchema from './entities/order-item.schema';
import { productsTable } from '../products/entities/products.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { eq, inArray, sql } from 'drizzle-orm';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { userId, items } = createOrderDto;

    // 1. Iniciar la transacción
    return await this.db.transaction(async (tx) => {
      let total = 0;

      // 2. Obtener todos los productos involucrados para validar stock y precio actual
      const productIds = items.map((i) => i.productId);
      const dbProducts = await tx
        .select()
        .from(productsTable)
        .where(inArray(productsTable.id, productIds));

      // 3. Validar y preparar los items para la inserción
      const itemsToInsert = await Promise.all(
        items.map(async (item) => {
          const product = dbProducts.find((p) => p.id === item.productId);

          if (!product) {
            throw new BadRequestException(`Producto con ID ${item.productId} no encontrado`);
          }

          // Validación de Stock
          if (product.stock < item.quantity) {
            throw new BadRequestException(
              `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
            );
          }

          const price = parseFloat(product.price);
          total += price * item.quantity;

          // 4. Actualizar stock del producto (Resta atómica)
          await tx
            .update(productsTable)
            .set({
              stock: sql`${productsTable.stock} - ${item.quantity}`,
            })
            .where(eq(productsTable.id, item.productId));

          return {
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: price.toString(),
          };
        }),
      );

      // 5. Crear la cabecera de la Orden
      const [newOrder] = await tx
        .insert(ordersTable)
        .values({
          userId,
          total: total.toString(),
        })
        .returning();

      // 6. Crear los detalles de la Orden (Order Items)
      const orderItemsPrepared = itemsToInsert.map((item) => ({
        ...item,
        orderId: newOrder.id,
      }));

      await tx.insert(orderItemsTable).values(orderItemsPrepared);

      // 7. Retornar la orden creada con sus items
      return {
        ...newOrder,
        items: orderItemsPrepared,
      };
    });
  }

  async findAll() {
    return await this.db.query.ordersTable.findMany({
      with: {
        user: true,
        items: {
          with: {
            product: true
          }
        } 
      },
    });
  }

  async findOne(id: number) {
    return await this.db.query.ordersTable.findFirst({
      where: eq(ordersTable.id, id),
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          }
        }
      }
    })
  }


  async findByUser(userId: number) {
    return await this.db.query.ordersTable.findMany({
      where: eq(ordersTable.userId, userId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
