import { eq } from 'drizzle-orm';

import { db } from '../persistence/database';
import { stocks } from '../persistence/schema';
import { createId, printTable } from '../utils';
import { findProduct } from './product';
import { formatUnit } from './utils';

export async function printStock() {
  const stocks = await db.query.stocks.findMany({
    with: { product: true },
  });

  printTable(
    ['Product', 'Qty'],
    stocks.map((stock) => [stock.product.name, formatUnit(stock.quantity, stock.product.unit)]),
  );
}

export async function updateStock(productName: string, quantity: number) {
  const product = await findProduct(productName);
  const stock = await findStock(product.id);

  if (stock) {
    await db.update(stocks).set({ quantity }).where(eq(stocks.id, stock.id));
  } else {
    await db.insert(stocks).values({ id: createId(), productId: product.id, quantity });
  }
}

async function findStock(productId: string) {
  return db.query.stocks.findFirst({
    where: (stocks, { eq }) => eq(stocks.productId, productId),
    with: {
      product: true,
    },
  });
}
