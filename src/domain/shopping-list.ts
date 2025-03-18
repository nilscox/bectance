import { eq } from 'drizzle-orm';

import { db } from '../persistence/database';
import {
  Product,
  ShoppingList,
  ShoppingListItem,
  shoppingList,
  shoppingListItems,
} from '../persistence/schema';
import { createId, hasProperty, printTable } from '../utils';
import { getProduct } from './product';
import { formatUnit } from './utils';

export async function getShoppingList(name: string) {
  const list = await db.query.shoppingList.findFirst({
    where: eq(shoppingList.name, name),
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  if (list === undefined) {
    throw new Error(`Cannot find shopping list "${name}"`);
  }

  return list;
}

export async function printShoppingList(shoppingListName: string) {
  const list = await getShoppingList(shoppingListName);

  printTable(
    ['Product', 'Qty', 'Checked'],
    list.items.map((item) => [
      item.product.name,
      item.quantity ? formatUnit(item.quantity, item.product.unit) : '',
      item.checked ? 'x' : '',
    ]),
  );
}

export async function createShoppingList(shoppingListName: string) {
  await db.insert(shoppingList).values({
    id: createId(),
    name: shoppingListName,
  });
}

export async function upsertShoppingListItem(
  shoppingListName: string,
  productName: string,
  options: Partial<{ quantity: number | false; checked: boolean }>,
) {
  const list = await getShoppingList(shoppingListName);
  const product = await getProduct(productName);
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
  await db.insert(shoppingListItems).values({
    id: createId(),
    shoppingListId: list.id,
    productId: product.id,
    quantity: options.quantity || undefined,
    checked: options.checked ?? false,
  });
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

  await db
    .update(shoppingListItems)
    .set({
      quantity: getQuantity(),
      checked: getChecked(),
    })
    .where(eq(shoppingListItems.id, item.id));
}
