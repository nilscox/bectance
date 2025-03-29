import * as schema from './persistence/schema';

export type Stock = schema.Stock & {
  product: schema.Product;
};

export type ShoppingList = schema.ShoppingList & {
  items: (schema.ShoppingListItem & { product: schema.Product })[];
};

export type Unit = schema.Unit;
