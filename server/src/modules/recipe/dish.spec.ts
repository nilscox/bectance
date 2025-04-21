import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { test as baseTest, describe, expect } from 'vitest';

import { config } from '../../config.js';
import { Database, migrate } from '../../persistence/database.js';
import * as schema from '../../persistence/schema.js';
import { createId, defined } from '../../utils.js';
import { createProduct } from '../product/product.domain.js';
import { createDish, getDish, updateDishQuantities } from './dish.domain.js';
import { addIngredient, createRecipe } from './recipe.domain.js';

declare module 'vitest' {
  export interface TestContext {
    db: Database;
  }
}
const test = baseTest.extend({
  dbName: `test_${createId()}`,
  async db({ dbName }, use) {
    const root = new pg.Client({ connectionString: 'postgres://postgres@localhost/postgres' });

    await root.connect();
    await root.query(`CREATE DATABASE "${dbName}"`);

    const client = new pg.Pool({ connectionString: `postgres://postgres@localhost/${dbName}` });
    const db = drizzle(client, { schema, casing: 'snake_case', logger: config.database.debug });

    await migrate(client);
    await use(db);

    await client.end();

    await root.query(`DROP DATABASE "${dbName}"`);
    await root.end();
  },
});

describe('dish', () => {
  test('cerate dish', async ({ db }) => {
    await createProduct(db, {
      id: 'productId',
      name: 'My product',
      defaultQuantity: 1,
      unit: 'gram',
    });

    await createRecipe(db, {
      id: 'recipeId',
      name: 'My recipe',
      description: '',
    });

    await addIngredient(db, 'recipeId', {
      id: 'ingredientId',
      productId: 'productId',
      quantity: 1,
    });

    await createDish(db, {
      id: 'dishId',
      date: new Date(),
      recipeId: 'recipeId',
    });

    let dish = await getDish(db, 'dishId');

    expect(dish).toHaveProperty('ingredients', [
      {
        id: expect.any(String),
        recipeId: 'recipeId',
        dishHistoryId: 'dishId',
        productId: 'productId',
        product: expect.anything(),
        quantity: 1,
      },
    ]);

    await updateDishQuantities(db, 'dishId', {
      quantities: [{ ingredientId: defined(dish?.ingredients[0]?.id), quantity: 2 }],
    });

    dish = await getDish(db, 'dishId');

    expect(dish).toHaveProperty('ingredients.0.quantity', 2);
  });
});
