import { integer, pgTable, decimal } from 'drizzle-orm/pg-core';
import { ordersTable } from './order.schema';
import { productsTable } from 'src/products/entities/products.schema';
import { relations } from 'drizzle-orm';

export const orderItemsTable = pgTable("order_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id")
    .references(() => ordersTable.id, { onDelete: 'cascade' })
    .notNull(),
  productId: integer("product_id")
    .references(() => productsTable.id)
    .notNull(),
  quantity: integer().notNull(),
  priceAtPurchase: decimal("price_at_purchase", { precision: 10, scale: 2 }).notNull(), 
});

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