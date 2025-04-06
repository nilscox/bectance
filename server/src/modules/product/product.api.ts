import * as dtos from '@bectance/shared/dtos';
import { Product } from '@bectance/shared/dtos';
import assert from 'assert';
import express, { Response } from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

import { getQueryParam } from '../../utils.js';
import { createProduct, getProduct, listProducts, updateProduct } from './product.domain.js';

export const product = express.Router();

export function mapProduct(product: Product): dtos.Product {
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
  defaultQuantity: z.number(),
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
