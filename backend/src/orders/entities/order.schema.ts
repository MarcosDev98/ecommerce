import { pgTable, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { usersTable } from "../../users/entities/user.schema";
import { productsTable } from '../../products/entities/products.schema';

export const ordersTable = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  total: numeric({ precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItemsTable = pgTable("order_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id").references(() => ordersTable.id).notNull(),
  productId: integer("product_id").references(() => productsTable.id).notNull(),
  quantity: integer().notNull(),
  priceAtPurchase: numeric("price_at_purchase", { precision: 10, scale: 2 }).notNull(),
});

// Relaciones para las consultas (findMany, etc.)
export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, { fields: [ordersTable.userId], references: [usersTable.id] }),
  items: many(orderItemsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, { fields: [orderItemsTable.orderId], references: [ordersTable.id] }),
  product: one(productsTable, { fields: [orderItemsTable.productId], references: [productsTable.id] }),
}));