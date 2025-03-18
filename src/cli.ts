import { Command, InvalidArgumentError } from 'commander';

import { addProduct, updateProduct } from './domain/product';
import {
  addProductToShoppingList,
  addShoppingList,
  printShoppingList,
  updateShoppingListItem,
} from './domain/shopping-list';
import { printStock, updateStock } from './domain/stock';
import { db } from './persistence/database';
import { Unit, unit } from './persistence/schema';

const product = new Command('product');

product
  .command('create')
  .description('Create a new product')
  .requiredOption('--name <name>', 'Name of the product')
  .requiredOption('--unit <unit>', 'Unit of the product', parseUnit)
  .action(addProduct);

product
  .command('product update')
  .description('Update an existing product')
  .argument('[name]', 'Name of the product')
  .option('--name <name>', 'Name of the product')
  .option('--unit <unit>', 'Unit of the product', parseUnit)
  .action(updateProduct);

const stock = new Command('stock');

stock.command('get').description('Print the current stock').action(printStock);

stock
  .command('update')
  .description('Update the current stock')
  .argument('<product>', 'Name of the product')
  .argument('<quantity>', 'Quantity to set', parsePositiveInteger)
  .action(updateStock);

const list = new Command('list');

list
  .command('get')
  .description('Print a shopping list')
  .argument('<name>', 'Name of the shopping list')
  .action(printShoppingList);

list
  .command('create')
  .description('Create a new shopping list')
  .argument('<name>', 'Name of the shopping list')
  .action(addShoppingList);

list
  .command('add-item')
  .description('Add a product to a shopping list')
  .argument('<list>', 'Name of the shopping list')
  .argument('<product>', 'Name of the product')
  .option('--quantity <value>', 'Quantity to add')
  .action(addProductToShoppingList);

list
  .command('update-item')
  .description('Update an item from a shopping list')
  .argument('<list>', 'Name of the shopping list')
  .argument('<product>', 'Name of the product')
  .option('--quantity <value>', 'Set the quantity', parsePositiveInteger)
  .option('--no-quantity', 'Remove the quantity')
  .option('--checked', 'Mark the product as checked')
  .option('--no-checked', 'Mark the product as not checked')
  .action(updateShoppingListItem);

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
