import { Command, InvalidArgumentError } from 'commander';
import { Table } from 'console-table-printer';

import { createProduct, updateProduct } from './server/domain/product';
import { createShoppingList, getShoppingList, upsertShoppingListItem } from './server/domain/shopping-list';
import { getStock, upsertStock } from './server/domain/stock';
import { db } from './server/persistence/database';
import { Unit, unit } from './server/persistence/schema';
import { toObject } from './utils';

const product = new Command('product');

product
  .command('create')
  .description('Create a new product')
  .requiredOption('--name <name>', 'Name of the product')
  .requiredOption('--unit <unit>', 'Unit of the product', parseUnit)
  .action(createProduct);

product
  .command('product update')
  .description('Update an existing product')
  .argument('[name]', 'Name of the product')
  .option('--name <name>', 'Name of the product')
  .option('--unit <unit>', 'Unit of the product', parseUnit)
  .action(updateProduct);

const stock = new Command('stock');

stock
  .command('get')
  .description('Print the current stock')
  .action(async () => {
    const stocks = await getStock();

    printTable(
      ['Product', 'Qty'],
      stocks.map((stock) => [stock.product.name, formatUnit(stock.quantity, stock.product.unit)]),
    );
  });

stock
  .command('update')
  .description('Update the current stock')
  .argument('<product>', 'Name of the product')
  .argument('<quantity>', 'Quantity to set', parsePositiveInteger)
  .action(upsertStock);

const list = new Command('list');

list
  .command('get')
  .description('Print a shopping list')
  .argument('<name>', 'Name of the shopping list')
  .action(async (name) => {
    const list = await getShoppingList(name);

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
  .argument('<name>', 'Name of the shopping list')
  .action(createShoppingList);

list
  .command('item')
  .description('Create or update an item from a shopping list')
  .argument('<list>', 'Name of the shopping list')
  .argument('<product>', 'Name of the product')
  .option('--quantity <value>', 'Set the quantity', parsePositiveInteger)
  .option('--no-quantity', 'Remove the quantity')
  .option('--checked', 'Mark the product as checked')
  .option('--no-checked', 'Mark the product as not checked')
  .action(upsertShoppingListItem);

const program = new Command();

program.addCommand(product);
program.addCommand(stock);
program.addCommand(list);

program.hook('postAction', () => db.$client.end());

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
  if (!unit.enumValues.includes(value as Unit)) {
    throw new InvalidArgumentError('Not a valid unit.');
  }

  return value;
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
