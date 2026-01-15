import { relations } from 'drizzle-orm';
import { integer, pgTable, decimal, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from 'src/users/entities/user.schema';
import { orderItemsTable } from './order-item.schema';

export const ordersTable = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  // Relacion: Una orden PERTENECE a un usuario
  userId: integer("user_id")
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  total: decimal({ precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull() 
});

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ordersTable.userId],
    references: [usersTable.id],
  }),
  items: many(orderItemsTable),
}));