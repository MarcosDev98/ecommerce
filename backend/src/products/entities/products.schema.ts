import { integer, pgTable, varchar, decimal, text, timestamp } from 'drizzle-orm/pg-core';

export const productsTable = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  stock: integer().default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});