import { integer, pgTable, varchar, decimal, text, timestamp } from 'drizzle-orm/pg-core';
import { productsTable } from './products.schema';

export const productImagesTable = pgTable('product_images', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  url: text().notNull(),
  productId: integer('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
});