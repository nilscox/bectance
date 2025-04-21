import { and, eq } from 'drizzle-orm';

import { BadRequestError, NotFoundError } from '../../errors.js';
import { Database } from '../../persistence/database.js';
import { Unit, products } from '../../persistence/schema.js';
import { defined } from '../../utils.js';

export async function listProducts(db: Database, filters?: { name?: string }) {
  let where = and();

  if (filters?.name !== undefined) {
    where = and(where, eq(products.name, filters.name));
  }

  return db.query.products.findMany({ where });
}

export async function findProduct(db: Database, productId: string) {
  return db.query.products.findFirst({ where: eq(products.id, productId) });
}

export async function getProduct(db: Database, productId: string) {
  return defined(
    await findProduct(db, productId),
    new NotFoundError('Cannot find product', { id: productId }),
  );
}

export async function createProduct(
  db: Database,
  values: { id: string; name: string; namePlural?: string; unit: Unit; defaultQuantity: number },
) {
  if (await productExists(db, values.name)) {
    throw new BadRequestError('Product already exists', { name: values.name });
  }

  await db.insert(products).values(values);
}

export async function updateProduct(
  db: Database,
  productId: string,
  options: Partial<{ name: string; unit: Unit }>,
) {
  await db
    .update(products)
    .set({
      name: options.name,
      unit: options.unit,
    })
    .where(eq(products.id, productId));
}

async function productExists(db: Database, name: string) {
  return (await db.$count(products, eq(products.name, name))) === 1;
}
