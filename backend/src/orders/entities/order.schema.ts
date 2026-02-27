import {
  pgTable,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from '../../users/entities/user.schema';
import { productsTable } from '../../products/entities/products.schema';

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]);

export const ordersTable = pgTable('orders', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .references(() => usersTable.id)
    .notNull(),
  total: numeric({ precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const orderItemsTable = pgTable('order_items', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer('order_id')
    .references(() => ordersTable.id, { onDelete: 'cascade' })
    .notNull(),
  productId: integer('product_id')
    .references(() => productsTable.id)
    .notNull(),
  quantity: integer().notNull(),
  priceAtPurchase: numeric('price_at_purchase', {
    precision: 10,
    scale: 2,
  }).notNull(),
});

// Relaciones
export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ordersTable.userId],
    references: [usersTable.id],
  }),
  items: many(orderItemsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.orderId],
    references: [ordersTable.id],
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.productId],
    references: [productsTable.id],
  }),
}));
