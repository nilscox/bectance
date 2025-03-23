import express, { NextFunction, Request, Response } from 'express';

import { routes } from './routes';

export const app = express();

app.use(express.json());
app.use(routes);
app.use(errorHandler);

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(500).send(err.message);
  void next;
}
