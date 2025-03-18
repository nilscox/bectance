import { InvalidArgumentError, program } from 'commander';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { customAlphabet } from 'nanoid';

import pg from 'pg';
import { config } from './config';
import * as schema from './schema';

const { products, stocks } = schema;

const units = ['unit', 'gram', 'liter'] as const;
type Unit = (typeof units)[number];

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

const client = new pg.Pool({ connectionString: config.database.url });
const db = drizzle(client, { schema, logger: config.database.debug });

function parseQuantity(value: string) {
  const sign = ['+', '-'].includes(value[0]) ? value[0] : null;
  const parsed = Number(sign === null ? value : value.slice(1));

  if (parsed < 0) {
    throw new InvalidArgumentError('Must be a valid quantity.');
  }

  return [sign, parsed] as const;
}

function parseUnit(value: string) {
  if (!units.includes(value as Unit)) {
    throw new InvalidArgumentError('Not a valid unit.');
  }

  return value;
}

async function productExists(name: string) {
  return (await db.$count(products, eq(products.name, name))) === 1;
}

async function findProduct(name: string) {
  const [product] = await db.select().from(products).where(eq(products.name, name));

  if (product === undefined) {
    throw new Error(`Cannot find product "${name}"`);
  }

  return product;
}

async function findStock(productId: string) {
  return db.query.stocks.findFirst({
    where: (stocks, { eq }) => eq(stocks.productId, productId),
    with: {
      product: true,
    },
  });
}

async function addProduct(options: { name: string; unit: Unit }) {
  if (await productExists(options.name)) {
    throw new Error(`Product "${options.name}" already exists`);
  }

  await db.insert(products).values({
    id: nanoid(),
    name: options.name,
    unit: options.unit,
  });
}

async function updateProduct(name: string, options: Partial<{ name: string; unit: Unit }>) {
  await db
    .update(products)
    .set({
      name: options.name,
      unit: options.unit,
    })
    .where(eq(products.name, name));
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

async function getStock() {
  const stocks = await db.query.stocks.findMany({
    with: { product: true },
  });

  const max = Math.max(...stocks.map((stock) => stock.product.name.length));

  for (const stock of stocks) {
    console.log(`${stock.product.name.padEnd(max)} | ${formatUnit(stock.quantity, stock.product.unit)}`);
  }
}

async function updateStock(productName: string, getQuantity: (current: number) => number) {
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

async function stock(productName: string, [sign, value]: [sign: '+' | '-' | null, value: number]) {
  await updateStock(productName, (current) => {
    if (sign === '+') {
      return current + value;
    }

    if (sign === '-') {
      return current - value;
    }

    return value;
  });
}

program
  .command('add-product')
  .description('Create a new product')
  .requiredOption('--name <name>', 'Name of the product')
  .requiredOption('--unit <unit>', 'Unit of the product', parseUnit)
  .action(addProduct);

program
  .command('update-product')
  .description('Update an existing product')
  .argument('[name]', 'Name of the product')
  .option('--name <name>', 'Name of the product')
  .option('--unit <unit>', 'Unit of the product', parseUnit)
  .action(updateProduct);

program.command('get-stock').description('Show the current stock').action(getStock);

program
  .command('stock')
  .description('Update the current stock')
  .argument('<product>', 'Name of the product')
  .argument('<quantity>', 'Quantity to set', parseQuantity)
  .action(stock);

program.hook('postAction', () => db.$client.end());

program.parse();
