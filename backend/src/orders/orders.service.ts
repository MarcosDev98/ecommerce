import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import type { DrizzleDB } from '../database/database.module';
import * as orderSchema from './entities/order.schema';
import * as itemSchema from './entities/order-item.schema';
import * as productSchema from '../products/entities/products.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { eq, inArray } from 'drizzle-orm';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { userId, items } = createOrderDto;
    
    return await this.db.transaction(async (tx) => {
      const productIds = items.map((i) => i.productId);

      const dbProducts = await tx.query.productsTable.findMany({
        where: inArray(productSchema.productsTable.id, productIds),
      });

      if (dbProducts.length !== items.length) {
        throw new BadRequestException('Uno o más productos no existen');
      }

      let total = 0;
      const itemsToInsert = items.map((item) => {
        const product = dbProducts.find((p) => p.id === item.productId);

        if (!product) {
          throw new BadRequestException(`Producto con ID ${item.productId} no existe`);
        }

        const price = parseFloat(product.price);
        total += price * item.quantity;

        return {
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: price.toString(),
        };
      });


      const [newOrder] = await tx
        .insert(orderSchema.ordersTable)
        .values({
          userId,
          total: total.toString(),
        })
        .returning()

        await tx.insert(itemSchema.orderItemsTable).values(
          itemsToInsert.map((i) => ({ ...i, orderId: newOrder.id })),
        );

        return this.findOne(newOrder.id);
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
      where: eq(orderSchema.ordersTable.id, id),
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

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
