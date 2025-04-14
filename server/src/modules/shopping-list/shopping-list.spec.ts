import test, { describe } from 'node:test';

import {
  createShoppingList,
  createShoppingListItem,
  deleteShoppingListItem,
  getShoppingList,
} from './shopping-list.domain.js';

describe('test', () => {
  test('reconcile shopping list item position', async () => {
    await createShoppingList('listId', 'My list');
    await createShoppingListItem('listId', 'itemId1', { label: 'Product 1' }, {});
    await createShoppingListItem('listId', 'itemId2', { label: 'Product 2' }, {});
    await deleteShoppingListItem('listId', 'itemId1');
    await createShoppingListItem('listId', 'itemId3', { label: 'Product 3' }, {});
    console.log(await getShoppingList('listId'));
  });
});
