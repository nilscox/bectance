import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../persistence/database';
import { products, Unit } from '../persistence/schema';

export async function findProduct(name: string) {
  const [product] = await db.select().from(products).where(eq(products.name, name));

  if (product === undefined) {
    throw new Error(`Cannot find product "${name}"`);
  }

  return product;
}

export async function addProduct(options: { name: string; unit: Unit }) {
  if (await productExists(options.name)) {
    throw new Error(`Product "${options.name}" already exists`);
  }

  await db.insert(products).values({
    id: nanoid(),
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
