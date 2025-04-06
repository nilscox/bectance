import * as dtos from '@bectance/shared/dtos';
import { Product } from '@bectance/shared/dtos';
import assert from 'assert';
import express, { Response } from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

import { Stock } from '../../persistence/schema.js';
import { mapProduct } from '../product/product.api.js';
import { getStock, upsertStock } from './stock.domain.js';

export const stock = express.Router();

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
