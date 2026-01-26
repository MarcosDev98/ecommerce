import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { ordersTable } from "src/orders/entities/order.schema";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text().notNull(),
  role: text().default('client').notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  orders: many(ordersTable),
}))