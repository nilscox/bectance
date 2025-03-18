import express, { ErrorRequestHandler } from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

import { config } from './config';
import { addDomainEventListener } from './domain/events';
import { createProduct, getProduct, listProducts, updateProduct } from './domain/product';
import { createShoppingList, getShoppingList, upsertShoppingListItem } from './domain/shopping-list';
import { getStock, upsertStock } from './domain/stock';

const app = express();

app.use(express.json());

const product = express.Router();

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

app.use('/product', product);

const stock = express.Router();

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

app.use('/stock', stock);

const shoppingList = express.Router();

shoppingList.get('/:list', async (req, res) => {
  res.json(await getShoppingList(req.params.list));
});

const createListBody = z.object({
  name: z.string().min(2),
});

shoppingList.post('/', validateRequestBody(createListBody), async (req, res) => {
  await createShoppingList(req.body.name);
  res.status(201).end();
});

const upsertListItemBody = z
  .object({
    quantity: z.number().min(0),
    checked: z.boolean(),
  })
  .partial();

shoppingList.put('/:list/:product', validateRequestBody(upsertListItemBody), async (req, res) => {
  res.json(await upsertShoppingListItem(req.params.list, req.params.product, req.body));
});

app.use('/shopping-list', shoppingList);

app.use(((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message ?? 'Unknown error');
  void next;
}) satisfies ErrorRequestHandler);

const events = ['shoppingListItemCreated', 'shoppingListItemUpdated'] as const;

for (const event of events) {
  addDomainEventListener(event, (payload) => console.log(event, payload));
}

const { host, port } = config.server;

const server = app.listen(port, host, () => {
  console.debug(`Server listening on ${host}:${port}`);
});

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);

function closeServer(signal: string) {
  console.debug(`${signal} signal received, closing server`);

  server.close(() => {
    console.debug('Server closed');
  });
}
