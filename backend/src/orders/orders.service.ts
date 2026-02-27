import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import type { DrizzleDB } from '../database/database.module';
import { ordersTable, orderItemsTable } from './entities/order.schema';
import {
  productsTable,
  productImagesTable,
} from '../products/entities/products.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import {
  GroupedOrder,
  OrderAccumulator,
  OrderQueryResult,
} from './orders-types';

type OrderStatus = typeof ordersTable.$inferInsert.status;

@Injectable()
export class OrdersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const { items } = createOrderDto;

    return await this.db.transaction(async (tx) => {
      let total = 0;

      const preparedItems: {
        productId: number;
        quantity: number;
        priceAtPurchase: string;
      }[] = [];

      for (const item of items) {
        const [product] = await tx
          .select()
          .from(productsTable)
          .where(
            and(
              eq(productsTable.id, item.productId),
              isNull(productsTable.deletedAt),
            ),
          );

        if (!product) {
          throw new NotFoundException(
            `Producto ID ${item.productId} no disponible.`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para: ${product.name}`,
          );
        }

        // Actualizar stock
        await tx
          .update(productsTable)
          .set({ stock: product.stock - item.quantity })
          .where(eq(productsTable.id, product.id));

        total += Number(product.price) * item.quantity;

        preparedItems.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase: product.price,
        });
      }

      // 2. Crear la cabecera
      const [newOrder] = await tx
        .insert(ordersTable)
        .values({
          userId,
          total: total.toString(),
          status: 'PENDING',
        })
        .returning();

      // 3. Crear los items vinculando el ID de la orden recién creada
      const finalItems = preparedItems.map((item) => ({
        ...item,
        orderId: newOrder.id,
      }));

      await tx.insert(orderItemsTable).values(finalItems);

      return newOrder;
    });
  }

  async findAll() {
    return await this.db.query.ordersTable.findMany({
      with: {
        user: true,
        items: {
          with: {
            product: true,
          },
        },
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
          },
        },
      },
    });
  }

  async findByUser(userId: number): Promise<GroupedOrder[]> {
    const rows: OrderQueryResult[] = await this.db
      .select({
        order: ordersTable,
        item: orderItemsTable,
        product: productsTable,
        image: productImagesTable,
      })
      .from(ordersTable)
      .leftJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.orderId))
      .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
      .leftJoin(
        productImagesTable,
        eq(productsTable.id, productImagesTable.productId),
      )
      .where(and(eq(ordersTable.userId, userId), isNull(ordersTable.deletedAt)))
      .orderBy(desc(ordersTable.createdAt));

    if (rows.length === 0) return [];

    return this.groupOrderResults(rows);
  }

  async remove(id: number) {
    const order = await this.db.query.ordersTable.findFirst({
      where: eq(ordersTable.id, id),
      with: { items: true },
    });

    if (!order) throw new NotFoundException(`Orden #${id} no existe`);
    if (order.deletedAt)
      throw new BadRequestException(`Esta orden ya fue eliminada`);

    return await this.db.transaction(async (tx) => {
      await tx
        .update(ordersTable)
        .set({
          deletedAt: new Date(),
          status: 'CANCELLED',
        })
        .where(eq(ordersTable.id, id));

      for (const item of order.items) {
        await tx
          .update(productsTable)
          .set({
            stock: sql`${productsTable.stock} + ${item.quantity}`,
          })
          .where(eq(productsTable.id, item.productId));
      }
      return { message: `Orden #${id} eliminada y stock restaurado.` };
    });
  }

  private groupOrderResults(rows: OrderQueryResult[]): GroupedOrder[] {
    // Tipamos el Map para que sepa qué contiene
    const ordersMap = new Map<number, OrderAccumulator>();

    for (const row of rows) {
      const orderId = row.order.id;

      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: row.order.id,
          total: row.order.total,
          createdAt: row.order.createdAt,
          status: row.order.status,
          items: new Map(),
        });
      }

      // Al tipar el Map arriba, 'currentOrder' ya no es 'any'
      const currentOrder = ordersMap.get(orderId)!;

      if (row.item) {
        const itemId = row.item.id;

        if (!currentOrder.items.has(itemId)) {
          currentOrder.items.set(itemId, {
            id: row.item.id,
            quantity: row.item.quantity,
            priceAtPurchase: row.item.priceAtPurchase,
            productName: row.product?.name ?? 'Producto no disponible',
            images: new Set(),
          });
        }

        if (row.image?.url) {
          currentOrder.items.get(itemId)?.images.add(row.image.url);
        }
      }
    }

    // Convertimos a la estructura final de GroupedOrder
    return Array.from(ordersMap.values()).map((order) => ({
      id: order.id,
      total: order.total,
      createdAt: order.createdAt,
      status: order.status,
      items: Array.from(order.items.values()).map((item) => ({
        id: item.id,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        productName: item.productName,
        images: Array.from(item.images),
      })),
    }));
  }

  async updateStatus(id: number, status: OrderStatus) {
    return await this.db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();
  }
}
