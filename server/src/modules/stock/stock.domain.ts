import { eq } from 'drizzle-orm';

import { Database } from '../../persistence/database.js';
import { stocks } from '../../persistence/schema.js';
import { createId } from '../../utils.js';
import { getProduct } from '../product/product.domain.js';

export async function getStock(db: Database) {
  return db.query.stocks.findMany({
    with: { product: true },
  });
}

export async function upsertStock(db: Database, productId: string, quantity: number) {
  const product = await getProduct(db, productId);
  const stock = await findStock(db, product.id);

  if (stock) {
    await db.update(stocks).set({ quantity }).where(eq(stocks.id, stock.id));
  } else {
    await db.insert(stocks).values({ id: createId(), productId: product.id, quantity });
  }
}

async function findStock(db: Database, productId: string) {
  return db.query.stocks.findFirst({
    where: (stocks, { eq }) => eq(stocks.productId, productId),
    with: {
      product: true,
    },
  });
}
