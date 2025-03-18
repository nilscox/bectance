import { isNull } from 'drizzle-orm';

import { db } from '../persistence/database';
import { shoppingList, shoppingListItems } from '../persistence/schema';
import { createId, hasProperty } from '../utils';
import { findProduct } from './product';

export async function printNextShoppingList() {
  const list = await getNextShoppingList();

  for (const item of list.items) {
    console.log(`${item.product.name} ${item.quantity ? `(${item.quantity})` : ''} `);
  }
}

export async function addProductToNextShoppingList(
  productName: string,
  options: Partial<{ quantity: number }>,
) {
  const product = await findProduct(productName);
  const list = await getNextShoppingList();

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

async function getNextShoppingList() {
  const list = await db.query.shoppingList.findFirst({
    where: isNull(shoppingList.date),
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  if (list === undefined) {
    await db.insert(shoppingList).values({ id: createId() });
    return getNextShoppingList();
  }

  return list;
}
