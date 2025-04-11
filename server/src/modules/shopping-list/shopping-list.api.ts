import * as dtos from '@bectance/shared/dtos';
import assert from 'assert';
import express, { Response } from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

import { addDomainEventListener } from '../../events.js';
import { Product, ShoppingList, ShoppingListItem } from '../../persistence/schema.js';
import { getQueryParam } from '../../utils.js';
import {
  createShoppingList,
  createShoppingListItem,
  deleteShoppingListItem,
  getShoppingList,
  listShoppingLists,
  updateShoppingListItem,
} from './shopping-list.domain.js';

export const shoppingList = express.Router();

function mapShoppingList(
  list: ShoppingList & { items: (ShoppingListItem & { product: Product | null })[] },
): dtos.ShoppingList {
  return {
    id: list.id,
    name: list.name,
    date: list.date,
    cost: list.cost,
    items: list.items.map((item) => ({
      id: item.id,
      quantity: item.quantity ?? undefined,
      checked: item.checked,
      label: (item.product?.name ?? item.label) as string,
      unit: item.product?.unit,
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

const createShoppingListItemBodyOptions = z.object({
  quantity: z.number().min(0).optional(),
  checked: z.boolean().optional(),
});

const createShoppingListItemBody = z.union([
  createShoppingListItemBodyOptions.extend({
    productId: z.string(),
  }),
  createShoppingListItemBodyOptions.extend({
    label: z.string(),
  }),
]);

shoppingList.post('/:listId', validateRequestBody(createShoppingListItemBody), async (req, res) => {
  assert(req.params.listId);

  res.json(await createShoppingListItem(req.params.listId, req.body, req.body));
});

const updateShoppingListItemBody = z
  .object({
    quantity: z.number().min(0),
    checked: z.boolean(),
  })
  .partial();

shoppingList.put('/:listId/:itemId', validateRequestBody(updateShoppingListItemBody), async (req, res) => {
  assert(req.params.listId);
  assert(req.params.itemId);

  res.json(await updateShoppingListItem(req.params.itemId, req.body));
});

shoppingList.delete('/:listId/:itemId', async (req, res) => {
  assert(req.params.listId);
  assert(req.params.itemId);

  res.json(await deleteShoppingListItem(req.params.listId, req.params.itemId));
});
