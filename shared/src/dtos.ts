export type Unit = 'unit' | 'gram' | 'liter';

export type Product = {
  id: string;
  name: string;
  unit: Unit;
};

export type ProductStock = Product & {
  quantity: number;
};

export type ShoppingList = {
  id: string;
  name: string;
  date: string | null;
  cost: string | null;
  items: ShoppingListItem[];
};

export type ShoppingListItem = {
  id: string;
  quantity: number | null;
  checked: boolean;
  product: Product;
};

export type DomainEvents = {
  shoppingListItemCreated: {
    id: string;
    shoppingListId: string;
    productId: string;
    quantity: number | null;
    checked: boolean;
  };

  shoppingListItemUpdated: {
    id: string;
    quantity?: number | null;
    checked?: boolean;
  };
};
