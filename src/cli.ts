import fs from 'node:fs';
import { customAlphabet } from 'nanoid';
import { InvalidArgumentError, program } from 'commander';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

const units = ['unit', 'gram', 'liter'] as const;
type Unit = (typeof units)[number];

type Product = {
  id: string;
  name: string;
  unit: Unit;
};

type ProductStock = {
  id: string;
  productId: string;
  quantity: number;
};

type Database = {
  products: Product[];
  stocks: ProductStock[];
};

function loadDatabase(): Database {
  return JSON.parse(String(fs.readFileSync(process.env.DB_PATH!)));
}

function updateDatabase() {
  fs.writeFileSync(process.env.DB_PATH!, JSON.stringify(db, null, 2));
}

const db = loadDatabase();

function parseInt(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (isNaN(parsed)) {
    throw new InvalidArgumentError('Not a number.');
  }

  return parsed;
}

function parsePositiveInt(value: string) {
  const parsed = parseInt(value);

  if (parsed < 0) {
    throw new InvalidArgumentError('Must be positive.');
  }

  return parsed;
}

function parseUnit(value: string) {
  if (!units.includes(value as Unit)) {
    throw new InvalidArgumentError('Not a valid unit.');
  }

  return value;
}

function productExists(name: string) {
  return db.products.some((product) => product.name === name);
}

function findProduct(name: string) {
  const product = db.products.find((product) => product.name === name);

  if (product === undefined) {
    throw new Error(`Cannot find product "${name}"`);
  }

  return product;
}

function createProduct(name: string, options: { unit: Unit }) {
  if (productExists(name)) {
    throw new Error(`Product "${name}" already exists`);
  }

  db.products.push({ id: nanoid(), name, unit: options.unit });

  updateDatabase();
}

function updateProduct(name: string, options: { name: string; unit: Unit }) {
  const product = findProduct(name);

  if ('name' in options) {
    if (productExists(options.name)) {
      throw new Error(`Product "${options.name}" already exists`);
    }

    product.name = options.name;
  }

  if ('unit' in options) {
    product.unit = options.unit;
  }

  updateDatabase();
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

function getStock() {
  const values = db.stocks.map((item) => {
    const product = db.products.find(({ id }) => item.productId === id)!;

    return {
      product: product.name,
      unit: product.unit,
      quantity: item.quantity,
    };
  });

  const max = Math.max(...values.map((value) => value.product.length));

  for (const value of values) {
    console.log(`${value.product.padEnd(max)} | ${formatUnit(value.quantity, value.unit)}`);
  }
}

function updateStock(
  productName: string,
  update: (stock: ProductStock | undefined, productId: string) => void
) {
  const product = findProduct(productName);
  let stock = db.stocks.find((item) => item.productId === product.id);

  update(stock, product.id);
  updateDatabase();
}

function addStock(productName: string, quantity: number) {
  updateStock(productName, (stock, productId) => {
    if (!stock) {
      stock = { id: nanoid(), productId: productId, quantity: 0 };
      db.stocks.push(stock);
    }

    stock.quantity += quantity;
  });
}

function removeStock(productName: string, quantity: number) {
  updateStock(productName, (stock) => {
    if (!stock) {
      throw new Error(`No existing stock for product "${productName}"`);
    }

    stock.quantity -= quantity;

    if (stock.quantity < 0) {
      stock.quantity = 0;
    }
  });
}

function setStock(productName: string, quantity: number) {
  updateStock(productName, (stock, productId) => {
    if (!stock) {
      stock = { id: nanoid(), productId: productId, quantity: 0 };
      db.stocks.push(stock);
    }

    stock.quantity = quantity;
  });
}

program
  .command('create-product')
  .description('Create a new product')
  .argument('<name>', 'Name of the product')
  .requiredOption('-u, --unit <unit>', 'Unit of the product', parseUnit)
  .action(createProduct);

program
  .command('update-product')
  .description('Update an existing product')
  .argument('<name>', 'Current name of the product')
  .option('-n, --name <name>', 'Updated name of the product')
  .option('-u, --unit <unit>', 'Updated unit of the product', parseUnit)
  .action(updateProduct);

program.command('get-stock').description('Show the current stock').action(getStock);

program
  .command('add-stock')
  .description('Add a quantity of product to the current stock')
  .argument('<product>', 'Name of the product')
  .argument('<quantity>', 'Quantity to add to the stock', parsePositiveInt)
  .action(addStock);

program
  .command('remove-stock')
  .description('Remove a quantity of product to the current stock')
  .argument('<product>', 'Name of the product')
  .argument('<quantity>', 'Quantity to remove from the stock', parsePositiveInt)
  .action(removeStock);

program
  .command('set-stock')
  .description('Set the quantity of product in the current stock')
  .argument('<product>', 'Name of the product')
  .argument('<quantity>', 'Quantity to set', parsePositiveInt)
  .action(setStock);

program.parse();
