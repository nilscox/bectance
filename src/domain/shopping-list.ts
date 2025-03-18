import { eq } from 'drizzle-orm';

import { db } from '../persistence/database';
import { shoppingList, shoppingListItems } from '../persistence/schema';
import { createId, hasProperty, printTable } from '../utils';
import { findProduct } from './product';
import { formatUnit } from './utils';

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

export async function addShoppingList(shoppingListName: string) {
  await db.insert(shoppingList).values({
    id: createId(),
    name: shoppingListName,
  });
}

export async function addProductToShoppingList(
  shoppingListName: string,
  productName: string,
  options: Partial<{ quantity: number }>,
) {
  const list = await getShoppingList(shoppingListName);
  const product = await findProduct(productName);

  if (list.items.find(hasProperty('productId', product.id))) {
    throw new Error('Next list already has product');
  }

  await db.insert(shoppingListItems).values({
    id: createId(),
    shoppingListId: list.id,
    productId: product.id,
    quantity: options.quantity,
    checked: false,
  });
}

export async function updateShoppingListItem(
  shoppingListName: string,
  productName: string,
  options: Partial<{ quantity: number | false; checked: boolean }>,
) {
  const list = await getShoppingList(shoppingListName);
  const product = await findProduct(productName);
  const item = list.items.find(hasProperty('productId', product.id));

  if (!item) {
    throw new Error('Next list does not have product');
  }

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

async function getShoppingList(name: string) {
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
