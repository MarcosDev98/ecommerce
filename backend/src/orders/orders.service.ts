import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import type { DrizzleDB } from '../database/database.module';
import { ordersTable, orderItemsTable } from './entities/order.schema';
import { productsTable } from '../products/entities/products.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { productImagesTable } from 'src/products/entities/product-images.schema';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB
  ) { }

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
    const rows = await this.db
      .select({
        order: ordersTable,
        item: orderItemsTable,
        product: productsTable,
        image: productImagesTable,
      })
      .from(ordersTable)
      .leftJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.orderId))
      .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
      .leftJoin(productImagesTable, eq(productsTable.id, productImagesTable.productId))
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt));

    if (!rows.length) return [];

    return this.groupOrderResults(rows);
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  private groupOrderResults(rows: any[]) {
    const ordersMap = new Map();

    for (const row of rows) {
      const orderId = row.order.id;

      // 1. Inicializar la orden si no existe en el mapa
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: row.order.id,
          total: row.order.total,
          createdAt: row.order.createdAt,
          status: row.order.status,
          items: new Map(),
        });
      }

      const currentOrder = ordersMap.get(orderId);

      // 2. Si la fila tiene un item, procesarlo
      if (row.item) {
        const itemId = row.item.id;

        if (!currentOrder.items.has(itemId)) {
          currentOrder.items.set(itemId, {
            id: row.item.id,
            quantity: row.item.quantity,
            priceAtPurchase: row.item.priceAtPurchase,
            productName: row.product?.name || 'Producto no disponible',
            images: new Set(),
          });
        }

        // 3. Agregar la imagen si existe
        if (row.image?.url) {
          currentOrder.items.get(itemId).images.add(row.image.url);
        }
      }
    }

    // 4. Convertir la estructura de Maps/Sets a un Array limpio para el JSON
    return Array.from(ordersMap.values()).map(order => ({
      ...order,
      items: Array.from(order.items.values()).map((item: any) => ({
        ...item,
        images: Array.from(item.images),
      })),
    }));
  }
}
