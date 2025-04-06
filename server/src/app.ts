import express, { NextFunction, Request, Response } from 'express';

import { BadRequestError, NotFoundError } from './errors.js';
import { product } from './modules/product/product.api.js';
import { shoppingList } from './modules/shopping-list/shopping-list.api.js';
import { stock } from './modules/stock/stock.api.js';

export const app = express();

const api = express.Router();

api.use('/product', product);
api.use('/stock', stock);
api.use('/shopping-list', shoppingList);

app.use(express.json());
app.use(api);
app.use(apiErrorHandler);
app.use(errorHandler);

function apiErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof BadRequestError || err instanceof NotFoundError) {
    const ErrorClass = err.constructor;

    if ('status' in ErrorClass && typeof ErrorClass.status === 'number') {
      res.status(ErrorClass.status);
    } else {
      res.status(500);
    }

    res.json({
      message: err.message,
      extra: err.extra,
    });
  } else {
    next(err);
  }
}

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(500).send(err.message);
  void next;
}
