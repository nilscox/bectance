import { relations, sql } from 'drizzle-orm';
import {
  PgEnum,
  boolean,
  check,
  customType,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

type PgEnumType<T> = T extends PgEnum<infer E> ? E[number] : never;

export const unit = pgEnum('unit', ['unit', 'gram', 'liter']);
export type Unit = PgEnumType<typeof unit>;

const id = () => varchar({ length: 8 });

// Thanks! https://github.com/drizzle-team/drizzle-orm/issues/1042#issuecomment-2224689025
export const numericNumber = customType<{ data: number; driverData: string }>({
  dataType: () => 'numeric',
  fromDriver: (value: string) => Number.parseFloat(value),
  toDriver: (value: number) => value.toString(),
});

export type Product = typeof products.$inferSelect;

export const products = pgTable('products', {
  id: id().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  unit: unit().notNull(),
  defaultQuantity: numericNumber().notNull(),
});

export type Stock = typeof stocks.$inferSelect;

export const stocks = pgTable('stocks', {
  id: id().primaryKey(),
  productId: id()
    .notNull()
    .references(() => products.id),
  quantity: numericNumber().notNull(),
});

export const productStocksRelations = relations(stocks, ({ one }) => ({
  product: one(products, {
    fields: [stocks.productId],
    references: [products.id],
  }),
}));

export type ShoppingList = typeof shoppingList.$inferSelect;

export const shoppingList = pgTable('shopping_lists', {
  id: id().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  date: date(),
  cost: numericNumber(),
});

export const shoppingListsRelations = relations(shoppingList, ({ many }) => ({
  items: many(shoppingListItems),
}));

export type ShoppingListItem = typeof shoppingListItems.$inferSelect;

export const shoppingListItems = pgTable(
  'shopping_list_items',
  {
    id: id().primaryKey(),
    shoppingListId: id()
      .notNull()
      .references(() => shoppingList.id),
    productId: id().references(() => products.id),
    label: varchar({ length: 255 }),
    quantity: numericNumber(),
    checked: boolean().notNull(),
    position: integer().notNull(),
  },
  (table) => [
    unique('position_unique').on(table.shoppingListId, table.position),
    check('shopping_list_items_product_id_xor_label', sql`("product_id" IS NULL) != ("label" IS NULL)`),
  ],
);

export const shoppingListItemsRelations = relations(shoppingListItems, ({ one }) => ({
  shoppingList: one(shoppingList, {
    fields: [shoppingListItems.shoppingListId],
    references: [shoppingList.id],
  }),
  product: one(products, {
    fields: [shoppingListItems.productId],
    references: [products.id],
  }),
}));

export type Recipe = typeof recipes.$inferSelect;

export const recipes = pgTable('recipes', {
  id: id().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
});

export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(ingredients),
}));

export type Ingredient = typeof ingredients.$inferSelect;

export const ingredients = pgTable('ingredients', {
  id: id().primaryKey(),
  quantity: numericNumber().notNull(),
  recipeId: id()
    .notNull()
    .references(() => recipes.id),
  dishHistoryId: id().references(() => dishHistory.id),
  productId: id()
    .notNull()
    .references(() => products.id),
});

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [ingredients.recipeId],
    references: [recipes.id],
  }),
  dishHistory: one(dishHistory, {
    fields: [ingredients.dishHistoryId],
    references: [dishHistory.id],
  }),
  product: one(products, {
    fields: [ingredients.productId],
    references: [products.id],
  }),
}));

export type DishHistory = typeof dishHistory.$inferSelect;

export const dishHistory = pgTable('dish_history', {
  id: id().primaryKey(),
  recipeId: id()
    .notNull()
    .references(() => recipes.id),
  description: text().notNull(),
});

export const dishHistoryRelations = relations(dishHistory, ({ many }) => ({
  ingredients: many(ingredients),
}));
