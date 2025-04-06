import { eq } from 'drizzle-orm';

import { db } from '../../persistence/database.js';
import { stocks } from '../../persistence/schema.js';
import { createId } from '../../utils.js';
import { getProduct } from '../product/product.domain.js';

export async function getStock() {
  return db.query.stocks.findMany({
    with: { product: true },
  });
}

export async function upsertStock(productId: string, quantity: number) {
  const product = await getProduct(productId);
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
