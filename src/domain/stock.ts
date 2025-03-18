import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { findProduct } from './product';
import { db } from '../persistence/database';
import { Unit, stocks } from '../persistence/schema';

export async function getStock() {
  const stocks = await db.query.stocks.findMany({
    with: { product: true },
  });

  const max = Math.max(...stocks.map((stock) => stock.product.name.length));

  for (const stock of stocks) {
    console.log(`${stock.product.name.padEnd(max)} | ${formatUnit(stock.quantity, stock.product.unit)}`);
  }
}

function formatUnit(quantity: number, unit: Unit) {
  if (unit === 'unit') {
    return `${quantity}`;
  }

  if (unit === 'gram') {
    return `${quantity}g`;
  }

  if (unit === 'liter') {
    return `${quantity}L`;
  }
}

export async function updateStock(productName: string, getQuantity: (current: number) => number) {
  const product = await findProduct(productName);
  const stock = await findStock(product.id);

  let quantity = getQuantity(stock?.quantity ?? 0);

  if (quantity < 0) {
    quantity = 0;
  }

  if (stock) {
    await db.update(stocks).set({ quantity }).where(eq(stocks.id, stock.id));
  } else {
    await db.insert(stocks).values({ id: nanoid(), productId: product.id, quantity });
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
