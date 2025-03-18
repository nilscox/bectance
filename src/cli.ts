import { InvalidArgumentError, program } from 'commander';

import { addProduct, updateProduct } from './domain/product';
import {
  addProductToShoppingList,
  addShoppingList,
  printShoppingList,
  updateShoppingListItem,
} from './domain/shopping-list';
import { printStock, updateStock } from './domain/stock';
import { ParsedQuantity } from './domain/utils';
import { db } from './persistence/database';
import { Unit, unit } from './persistence/schema';

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

program.command('stock').description('Print the current stock').action(printStock);

program
  .command('update-stock')
  .description('Update the current stock')
  .argument('<product>', 'Name of the product')
  .argument('<quantity>', 'Quantity to set', parseQuantity)
  .action(async (productName: string, [sign, value]: ParsedQuantity) => {
    await updateStock(productName, (current) => {
      if (sign === '+') {
        return current + value;
      }

      if (sign === '-') {
        return current - value;
      }

      return value;
    });
  });

program
  .command('list')
  .description('Print a shopping list')
  .argument('<name>', 'Name of the shopping list')
  .action(printShoppingList);

program
  .command('add-list')
  .description('Create a new shopping list')
  .argument('<list>', 'Name of the shopping list')
  .action(addShoppingList);

program
  .command('add-list-item')
  .description('Add a product to a shopping list')
  .argument('<list>', 'Name of the shopping list')
  .argument('<product>', 'Name of the product')
  .option('--quantity <value>', 'Quantity to add')
  .action(addProductToShoppingList);

program
  .command('update-list-item')
  .description('Update an item from a shopping list')
  .argument('<list>', 'Name of the shopping list')
  .argument('<product>', 'Name of the product')
  .option('--quantity <value>', 'Set the quantity', parsePositiveInteger)
  .option('--no-quantity', 'Remove the quantity')
  .option('--checked', 'Mark the product as checked')
  .option('--no-checked', 'Mark the product as not checked')
  .action(updateShoppingListItem);

program.hook('postAction', () => db.$client.end());

program.parse();

function isQuantitySign(value: string): value is Exclude<ParsedQuantity[0], null> {
  return ['+', '-'].includes(value);
}

function parseQuantity(value: string): ParsedQuantity {
  const sign = isQuantitySign(value[0]) ? value[0] : null;
  const parsed = Number(sign === null ? value : value.slice(1));

  if (parsed < 0) {
    throw new InvalidArgumentError('Must be a valid quantity.');
  }

  return [sign, parsed];
}

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
