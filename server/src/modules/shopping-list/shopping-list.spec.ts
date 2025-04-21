import { describe, test } from 'vitest';

import {
  createShoppingList,
  createShoppingListItem,
  deleteShoppingListItem,
  getShoppingList,
} from './shopping-list.domain.js';

describe('test', () => {
  test('reconcile shopping list item position', async ({ db }) => {
    await createShoppingList(db, 'listId', 'My list');
    await createShoppingListItem(db, 'listId', 'itemId1', { label: 'Product 1' }, {});
    await createShoppingListItem(db, 'listId', 'itemId2', { label: 'Product 2' }, {});
    await deleteShoppingListItem(db, 'listId', 'itemId1');
    await createShoppingListItem(db, 'listId', 'itemId3', { label: 'Product 3' }, {});
    console.log(await getShoppingList(db, 'listId'));
  });
});
