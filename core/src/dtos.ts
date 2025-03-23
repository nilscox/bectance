import * as schema from './persistence/schema';

export type ShoppingList = schema.ShoppingList & {
  items: (schema.ShoppingListItem & { product: schema.Product })[];
};
