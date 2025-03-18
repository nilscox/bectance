import { relations } from 'drizzle-orm';
import { integer, PgEnum, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

type PgEnumType<T> = T extends PgEnum<infer E> ? E[number] : never;

export const unit = pgEnum('unit', ['unit', 'gram', 'liter']);
export type Unit = PgEnumType<typeof unit>;

const id = () => varchar({ length: 8 });

export type Product = typeof products.$inferSelect;

export const products = pgTable('products', {
  id: id().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  unit: unit().notNull(),
});

export type Stock = typeof stocks.$inferSelect;

export const stocks = pgTable('stocks', {
  id: id().primaryKey(),
  productId: id().notNull(),
  quantity: integer().notNull(),
});

export const productStocksRelations = relations(stocks, ({ one }) => ({
  product: one(products, {
    fields: [stocks.productId],
    references: [products.id],
  }),
}));
