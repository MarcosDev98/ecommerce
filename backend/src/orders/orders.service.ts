import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import type { DrizzleDB } from '../database/database.module';
import { ordersTable, orderItemsTable } from './entities/order.schema';
import { productsTable, productImagesTable } from '../products/entities/products.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB
  ) { }

  async create(createOrderDto: CreateOrderDto, userId: number) {
  const { items } = createOrderDto;

  return await this.db.transaction(async (tx) => {
    let total = 0;
    
    const preparedItems: { 
      productId: number; 
      quantity: number; 
      priceAtPurchase: string 
    }[] = [];

    for (const item of items) {
      const [product] = await tx
        .select()
        .from(productsTable)
        .where(
          and(
            eq(productsTable.id, item.productId),
            isNull(productsTable.deletedAt)
          )
        );

      if (!product) {
        throw new NotFoundException(`Producto ID ${item.productId} no disponible.`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Stock insuficiente para: ${product.name}`);
      }

      // Actualizar stock
      await tx.update(productsTable)
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
    const [newOrder] = await tx.insert(ordersTable).values({
      userId,
      total: total.toString(),
      status: 'PENDING',
    }).returning();

    // 3. Crear los items vinculando el ID de la orden recién creada
    const finalItems = preparedItems.map(item => ({
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
      .where(and(
        eq(ordersTable.userId, userId),
        isNull(ordersTable.deletedAt)
      ))
      .orderBy(desc(ordersTable.createdAt));

    if (!rows.length) return [];

    return this.groupOrderResults(rows);
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  async remove(id: number) {
    const order = await this.db.query.ordersTable.findFirst({
      where: eq(ordersTable.id, id),
      with: { items: true },
    });

    if (!order) throw new NotFoundException(`Orden #${id} no existe`);
    if (order.deletedAt) throw new BadRequestException(`Esta orden ya fue eliminada`);

    return await this.db.transaction(async (tx) => {
      await tx.update(ordersTable)
        .set({
          deletedAt: new Date(),
          status: 'CANCELLED',
        })
        .where(eq(ordersTable.id, id));

      for (const item of order.items) {
        await tx.update(productsTable)
          .set({
            stock: sql`${productsTable.stock} + ${item.quantity}`
          })
          .where(eq(productsTable.id, item.productId));
      }
      return { message: `Orden #${id} eliminada y stock restaurado.` };
    });
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

  async updateStatus(id: number, status: string) {
    return await this.db
      .update(ordersTable)
      .set({ status: status as any })
      .where(eq(ordersTable.id, id))
      .returning();
  }
}
