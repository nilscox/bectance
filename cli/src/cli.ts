import 'dotenv/config';

import { Product, ProductStock, ShoppingList, Unit } from '@boubouffe/shared/dtos';
import { toObject } from '@boubouffe/shared/utils';
import { Command, InvalidArgumentError } from 'commander';
import { Table } from 'console-table-printer';

import { api } from './api';

const product = new Command('product');

product
  .command('list')
  .description('Print a list of all products')
  .action(async () => {
    const products = await api<Product[]>('GET', '/product');

    printTable(
      ['Name', 'Unit'],
      products.map((product) => [product.name, product.unit]),
    );
  });

product
  .command('create')
  .description('Create a new product')
  .requiredOption('--name <name>', 'Name of the product')
  .requiredOption('--unit <unit>', 'Unit of the product', parseUnit)
  .action(async ({ name, unit }) => {
    await api('POST', '/product', { body: { name, unit } });
  });

product
  .command('update')
  .description('Update an existing product')
  .argument('<name>', 'Name of the product', parseProductName)
  .option('--name <name>', 'Name of the product')
  .option('--unit <unit>', 'Unit of the product', parseUnit)
  .action(async (productId, options) => {
    await api('PUT', `/product/${productId}`, { body: options });
  });

const stock = new Command('stock');

stock
  .command('get')
  .description('Print the current stock')
  .action(async () => {
    const stocks = await api<ProductStock[]>('GET', '/stock');

    printTable(
      ['Product', 'Qty'],
      stocks.map((product) => [product.name, formatUnit(product.quantity, product.unit)]),
    );
  });

stock
  .command('update')
  .description('Update the current stock')
  .argument('<product>', 'Name of the product', parseProductName)
  .argument('<quantity>', 'Quantity to set', parsePositiveInteger)
  .action(async (productId, quantity) => {
    await api('PUT', `/stock/${productId}`, {
      body: { quantity },
    });
  });

const list = new Command('list');

list
  .command('get')
  .description('Print a shopping list')
  .argument('<name>', 'Name of the shopping list', parseShoppingListName)
  .action(async (listId) => {
    const list = await api<ShoppingList>('GET', `/shopping-list/${listId}`);

    printTable(
      ['Product', 'Qty', 'Checked'],
      list.items.map((item) => [
        item.product.name,
        item.quantity ? formatUnit(item.quantity, item.product.unit) : '',
        item.checked ? 'x' : '',
      ]),
    );
  });

list
  .command('create')
  .description('Create a new shopping list')
  .requiredOption('--name', 'Name of the shopping list')
  .action(async (name) => {
    await api('POST', '/shopping-list', {
      body: { name },
    });
  });

list
  .command('item')
  .description('Create or update an item from a shopping list')
  .argument('<list>', 'Name of the shopping list', parseShoppingListName)
  .argument('<product>', 'Name of the product', parseProductName)
  .option('--quantity <value>', 'Set the quantity', parsePositiveInteger)
  .option('--no-quantity', 'Remove the quantity')
  .option('--checked', 'Mark the product as checked')
  .option('--no-checked', 'Mark the product as not checked')
  .action(async (listId, productId, options) => {
    await api('PUT', `/shopping-list/${listId}/${productId}`, {
      body: options,
    });
  });

const program = new Command();

program.addCommand(product);
program.addCommand(stock);
program.addCommand(list);

program.hook('preAction', async function (_, action) {
  action.processedArgs = await Promise.all(action.processedArgs);
});

program.parse();

function parsePositiveInteger(value: string): number {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new InvalidArgumentError('Must be a valid number.');
  }

  if (!Number.isInteger(parsed)) {
    throw new InvalidArgumentError('Must be an integer.');
  }

  if (parsed < 0) {
    throw new InvalidArgumentError('Must be a positive.');
  }

  return parsed;
}

function parseUnit(value: string) {
  const units: Unit[] = ['unit', 'gram', 'liter'];

  if (!units.includes(value as Unit)) {
    throw new InvalidArgumentError('Not a valid unit.');
  }

  return value;
}

async function parseShoppingListName(name: string) {
  const [list] = await api<{ id: string }[]>('GET', '/shopping-list', {
    query: { name },
  });

  if (!list) {
    throw new InvalidArgumentError('Cannot find shopping list');
  }

  return list.id;
}

async function parseProductName(name: string) {
  const [product] = await api<{ id: string }[]>('GET', '/product', {
    query: { name },
  });

  if (!product) {
    throw new InvalidArgumentError('Cannot find product');
  }

  return product.id;
}

export function formatUnit(quantity: number, unit: Unit) {
  if (unit === 'unit') {
    return `${quantity}`;
  }

  if (unit === 'gram') {
    return `${quantity}g`;
  }

  if (unit === 'liter') {
    return `${quantity}L`;
  }

  throw new Error('Unknown unit');
}

export function printTable(columns: string[], values: string[][]) {
  if (values.length === 0) {
    console.log('No data.');
    return;
  }

  const table = new Table({
    columns: columns.map((name) => ({ name })),
  });

  values.forEach((row) =>
    table.addRow(
      toObject(
        columns,
        (key) => key,
        (_, index) => row[index],
      ),
    ),
  );

  table.printTable();
}
