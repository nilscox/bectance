import * as dtos from '@bectance/shared/dtos';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

import { createProduct, getProduct, listProducts, updateProduct } from './domain/product.js';
import {
  createShoppingList,
  deleteShoppingListItem,
  getShoppingList,
  listShoppingLists,
  upsertShoppingListItem,
} from './domain/shopping-list.js';
import { getStock, upsertStock } from './domain/stock.js';
import { addDomainEventListener } from './events.js';
import { Product, ShoppingList, ShoppingListItem, Stock } from './persistence/schema.js';
import { assert } from './utils.js';

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

function mapProduct(product: Product): dtos.Product {
  return {
    id: product.id,
    name: product.name,
    unit: product.unit,
  };
}

product.get('/', async (req, res: Response<dtos.Product[]>) => {
  const products = await listProducts({ name: getQueryParam(req, 'name') });

  res.json(products.map(mapProduct));
});

product.get('/:productId', async (req, res: Response<dtos.Product>) => {
  const product = await getProduct(req.params.productId);

  res.json(mapProduct(product));
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
  assert(req.params.productId);

  await updateProduct(req.params.productId, req.body);

  res.end();
});

// stock

function mapStock(stock: Stock & { product: Product }): dtos.ProductStock {
  return {
    ...mapProduct(stock.product),
    quantity: stock.quantity,
  };
}

stock.get('/', async (req, res: Response<dtos.ProductStock[]>) => {
  const stock = await getStock();

  res.json(stock.map(mapStock));
});

const updateStockBody = z.object({
  quantity: z.number().min(0),
});

stock.put('/:productId', validateRequestBody(updateStockBody), async (req, res) => {
  assert(req.params.productId);

  await upsertStock(req.params.productId, req.body.quantity);

  res.end();
});

// shopping list

function mapShoppingList(
  list: ShoppingList & { items: (ShoppingListItem & { product: Product })[] },
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
