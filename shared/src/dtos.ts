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
  label: string;
  checked: boolean;
  quantity?: number;
  unit?: Unit;
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
};

export type Ingredient = {
  id: string;
  quantity: number;
  product: Product;
};

export type DomainEvents = {
  shoppingListItemCreated: {
    id: string;
    shoppingListId: string;
    label: string;
    checked: boolean;
    quantity?: number;
    unit?: Unit;
  };

  shoppingListItemUpdated: {
    id: string;
    label?: string;
    quantity?: number;
    checked?: boolean;
  };

  shoppingListItemDeleted: {
    id: string;
  };
};
