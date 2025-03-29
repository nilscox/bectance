import { and, eq } from 'drizzle-orm';

import { BadRequestError, NotFoundError } from '../errors.js';
import { db } from '../persistence/database.js';
import { Unit, products } from '../persistence/schema.js';
import { createId, defined } from '../utils.js';

export async function listProducts(filters?: { name?: string }) {
  let where = and();

  if (filters?.name !== undefined) {
    where = and(where, eq(products.name, filters.name));
  }

  return db.query.products.findMany({ where });
}

export async function getProduct(productId: string) {
  const [product] = await db.select().from(products).where(eq(products.id, productId));

  return defined(product, new NotFoundError('Cannot find product', { id: productId }));
}

export async function createProduct(options: { name: string; unit: Unit }) {
  if (await productExists(options.name)) {
    throw new BadRequestError('Product already exists', { name: options.name });
  }

  await db.insert(products).values({
    id: createId(),
    name: options.name,
    unit: options.unit,
  });
}

export async function updateProduct(productId: string, options: Partial<{ name: string; unit: Unit }>) {
  await db
    .update(products)
    .set({
      name: options.name,
      unit: options.unit,
    })
    .where(eq(products.id, productId));
}

async function productExists(name: string) {
  return (await db.$count(products, eq(products.name, name))) === 1;
}
