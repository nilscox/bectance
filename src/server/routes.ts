import express from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

import { addDomainEventListener } from './domain/events';
import { createProduct, getProduct, listProducts, updateProduct } from './domain/product';
import { createShoppingList, getShoppingList, upsertShoppingListItem } from './domain/shopping-list';
import { getStock, upsertStock } from './domain/stock';

export const routes = express.Router();

const product = express.Router();
const stock = express.Router();
const shoppingList = express.Router();

routes.use('/product', product);
routes.use('/stock', stock);
routes.use('/shopping-list', shoppingList);

// product

product.get('/', async (req, res) => {
  res.json(await listProducts());
});

product.get('/:name', async (req, res) => {
  res.json(await getProduct(req.params.name));
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

product.put('/:name', validateRequestBody(updateProductBody), async (req, res) => {
  await updateProduct(req.params.name, req.body);
  res.end();
});

// stock

stock.get('/', async (req, res) => {
  res.json(await getStock());
});

const updateStockBody = z.object({
  quantity: z.number().min(0),
});

stock.put('/:name', validateRequestBody(updateStockBody), async (req, res) => {
  await upsertStock(req.params.name, req.body.quantity);
  res.end();
});

// shopping list

shoppingList.get('/:list', async (req, res) => {
  res.json(await getShoppingList(req.params.list));
});

shoppingList.get('/:list/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const handleEvent = (event: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(event)) {
      if (value !== undefined) {
        res.write(`${key}: ${value}\n`);
      }
    }
    res.write('\n');
  };

  const events = ['shoppingListItemCreated', 'shoppingListItemUpdated'] as const;

  const subscriptions = events.map((event) => {
    return addDomainEventListener(event, (payload) => handleEvent({ event, ...payload }));
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

shoppingList.put('/:list/:product', validateRequestBody(upsertShoppingListItemBody), async (req, res) => {
  res.json(await upsertShoppingListItem(req.params.list, req.params.product, req.body));
});
