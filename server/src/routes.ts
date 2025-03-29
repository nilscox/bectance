import {
  addDomainEventListener,
  createProduct,
  createShoppingList,
  getProduct,
  getShoppingList,
  getStock,
  listProducts,
  listShoppingLists,
  updateProduct,
  upsertShoppingListItem,
  upsertStock,
} from '@boubouffe/core';
import express, { Request } from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

export const routes = express.Router();

const product = express.Router();
const stock = express.Router();
const shoppingList = express.Router();

routes.use('/product', product);
routes.use('/stock', stock);
routes.use('/shopping-list', shoppingList);

function getQueryParam(req: Request, name: string): string | undefined {
  if (typeof req.query[name] === 'string') {
    return req.query[name];
  }
}

// product

product.get('/', async (req, res) => {
  res.json(await listProducts({ name: getQueryParam(req, 'name') }));
});

product.get('/:productId', async (req, res) => {
  res.json(await getProduct(req.params.productId));
});

const createProductBody = z.object({
  name: z.string().min(2),
  unit: z.union([z.literal('unit'), z.literal('gram'), z.literal('liter')]),
});

product.post('/', validateRequestBody(createProductBody), async (req, res) => {
  await createProduct(req.body);
  res.status(201).end();
});

const updateProductBody = createProductBody.partial();

product.put('/:productId', validateRequestBody(updateProductBody), async (req, res) => {
  await updateProduct(req.params.productId, req.body);
  res.end();
});

// stock

stock.get('/', async (req, res) => {
  res.json(await getStock());
});

const updateStockBody = z.object({
  quantity: z.number().min(0),
});

stock.put('/:productId', validateRequestBody(updateStockBody), async (req, res) => {
  await upsertStock(req.params.productId, req.body.quantity);
  res.end();
});

// shopping list

shoppingList.get('/', async (req, res) => {
  res.json(await listShoppingLists({ name: getQueryParam(req, 'name') }));
});

shoppingList.get('/:listId', async (req, res) => {
  res.json(await getShoppingList(req.params.listId));
});

shoppingList.get('/:listId/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const handleEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const events = ['shoppingListItemCreated', 'shoppingListItemUpdated'] as const;

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
  res.json(await upsertShoppingListItem(req.params.listId, req.params.productId, req.body));
});
