import { eq } from 'drizzle-orm';

import { createId } from '../../utils';
import { db } from '../persistence/database';
import { Unit, products } from '../persistence/schema';

export async function getProduct(name: string) {
  const [product] = await db.select().from(products).where(eq(products.name, name));

  if (product === undefined) {
    throw new Error(`Cannot find product "${name}"`);
  }

  return product;
}

export async function listProducts() {
  return db.query.products.findMany();
}

export async function createProduct(options: { name: string; unit: Unit }) {
  if (await productExists(options.name)) {
    throw new Error(`Product "${options.name}" already exists`);
  }

  await db.insert(products).values({
    id: createId(),
    name: options.name,
    unit: options.unit,
  });
}

export async function updateProduct(name: string, options: Partial<{ name: string; unit: Unit }>) {
  await db
    .update(products)
    .set({
      name: options.name,
      unit: options.unit,
    })
    .where(eq(products.name, name));
}

async function productExists(name: string) {
  return (await db.$count(products, eq(products.name, name))) === 1;
}
