import { InvalidArgumentError, program } from 'commander';

import { db } from './persistence/database';
import { Unit, unit } from './persistence/schema';
import { addProduct, updateProduct } from './domain/product';
import { getStock, updateStock } from './domain/stock';

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
  .action(async (productName: string, [sign, value]: [sign: '+' | '-' | null, value: number]) => {
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

program.hook('postAction', () => db.$client.end());

program.parse();

function parseQuantity(value: string) {
  const sign = ['+', '-'].includes(value[0]) ? value[0] : null;
  const parsed = Number(sign === null ? value : value.slice(1));

  if (parsed < 0) {
    throw new InvalidArgumentError('Must be a valid quantity.');
  }

  return [sign, parsed] as const;
}

function parseUnit(value: string) {
  if (!unit.enumValues.includes(value as Unit)) {
    throw new InvalidArgumentError('Not a valid unit.');
  }

  return value;
}
