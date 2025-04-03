import { and, eq } from 'drizzle-orm';

import { NotFoundError } from '../errors.js';
import { emitDomainEvent } from '../events.js';
import { db } from '../persistence/database.js';
import {
  Product,
  ShoppingList,
  ShoppingListItem,
  shoppingList,
  shoppingListItems,
} from '../persistence/schema.js';
import { createId, defined, hasProperty } from '../utils.js';
import { getProduct } from './product.js';

export async function listShoppingLists(filters?: { name?: string }) {
  let where = and();

  if (filters?.name !== undefined) {
    where = and(where, eq(shoppingList.name, filters.name));
  }

  return db.query.shoppingList.findMany({
    where,
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });
}

export async function getShoppingList(listId: string) {
  const list = await db.query.shoppingList.findFirst({
    where: eq(shoppingList.id, listId),
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  return defined(list, new NotFoundError('Cannot find shopping list', { id: listId }));
}

export async function createShoppingList(shoppingListName: string) {
  await db.insert(shoppingList).values({
    id: createId(),
    name: shoppingListName,
  });
}

export async function upsertShoppingListItem(
  shoppingListId: string,
  productId: string,
  options: Partial<{ quantity: number | false; checked: boolean }>,
) {
  const list = await getShoppingList(shoppingListId);
  const product = await getProduct(productId);
  const item = list.items.find(hasProperty('productId', product.id));

  if (item) {
    await updateShoppingListItem(item, options);
  } else {
    await createShoppingListItem(list, product, options);
  }
}

export async function createShoppingListItem(
  list: ShoppingList,
  product: Product,
  options: Partial<{ quantity: number | false; checked: boolean }>,
) {
  const values = {
    id: createId(),
    shoppingListId: list.id,
    productId: product.id,
    quantity: options.quantity || null,
    checked: options.checked ?? false,
  };

  await db.insert(shoppingListItems).values(values);

  emitDomainEvent('shoppingListItemCreated', values);
}

export async function updateShoppingListItem(
  item: ShoppingListItem,
  options: Partial<{ quantity: number | false; checked: boolean }>,
) {
  if (Object.keys(options).length === 0) {
    return;
  }

  const getQuantity = () => {
    if (options.quantity === false) {
      return null;
    }

    if (options.quantity !== undefined) {
      return options.quantity;
    }
  };

  const getChecked = () => {
    if (options.checked !== undefined) {
      return options.checked;
    }
  };

  const values = {
    quantity: getQuantity(),
    checked: getChecked(),
  };

  await db.update(shoppingListItems).set(values).where(eq(shoppingListItems.id, item.id));

  emitDomainEvent('shoppingListItemUpdated', { id: item.id, ...values });
}
