import { integer, pgTable, varchar, decimal, text, timestamp } from 'drizzle-orm/pg-core';

export const productsTable = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  stock: integer().default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const productImagesTable = pgTable('product_images', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  url: text().notNull(),
  productId: integer('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  deletedAt: timestamp('deleted_at'),
});