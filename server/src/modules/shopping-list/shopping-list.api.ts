import * as dtos from '@bectance/shared/dtos';
import assert from 'assert';
import express, { Response } from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

import { addDomainEventListener } from '../../events.js';
import { getQueryParam } from '../../utils.js';
import { mapProduct } from '../product/product.api.js';
import {
  createShoppingList,
  deleteShoppingListItem,
  getShoppingList,
  listShoppingLists,
  upsertShoppingListItem,
} from './shopping-list.domain.js';

export const shoppingList = express.Router();

function mapShoppingList(
  list: dtos.ShoppingList & { items: (dtos.ShoppingListItem & { product: dtos.Product })[] },
): dtos.ShoppingList {
  return {
    id: list.id,
    name: list.name,
    date: list.date,
    cost: list.cost,
    items: list.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      checked: item.checked,
      product: mapProduct(item.product),
    })),
  };
}

shoppingList.get('/', async (req, res: Response<dtos.ShoppingList[]>) => {
  const lists = await listShoppingLists({ name: getQueryParam(req, 'name') });

  res.json(lists.map(mapShoppingList));
});

shoppingList.get('/:listId', async (req, res: Response<dtos.ShoppingList>) => {
  const list = await getShoppingList(req.params.listId);

  res.json(mapShoppingList(list));
});

shoppingList.get('/:listId/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const handleEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const events = ['shoppingListItemCreated', 'shoppingListItemUpdated', 'shoppingListItemDeleted'] as const;

  const subscriptions = events.map((event) => {
    return addDomainEventListener(event, (payload: unknown) => handleEvent(event, payload));
  });

  console.debug('Client connected to shopping list event stream');

  req.on('close', () => {
    console.debug('Shopping list event stream connection closed');
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    res.end();
  });
});

const createShoppingListBody = z.object({
  name: z.string().min(2),
});

shoppingList.post('/', validateRequestBody(createShoppingListBody), async (req, res) => {
  await createShoppingList(req.body.name);
  res.status(201).end();
});

const upsertShoppingListItemBody = z
  .object({
    quantity: z.number().min(0),
    checked: z.boolean(),
  })
  .partial();

shoppingList.put('/:listId/:productId', validateRequestBody(upsertShoppingListItemBody), async (req, res) => {
  assert(req.params.listId);
  assert(req.params.productId);

  res.json(await upsertShoppingListItem(req.params.listId, req.params.productId, req.body));
});

shoppingList.delete('/:listId/:itemId', async (req, res) => {
  assert(req.params.listId);
  assert(req.params.itemId);

  res.json(await deleteShoppingListItem(req.params.listId, req.params.itemId));
});
