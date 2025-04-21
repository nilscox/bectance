import { and, eq, sql } from 'drizzle-orm';

import { NotFoundError } from '../../errors.js';
import { Database } from '../../persistence/database.js';
import { dishHistory, ingredients, recipes } from '../../persistence/schema.js';
import { createId } from '../../utils.js';

const relations = {
  recipe: true as const,
  ingredients: {
    with: { product: true as const },
  },
};

export function listDish(db: Database) {
  return db.query.dishHistory.findMany({
    with: relations,
  });
}

export function getDish(db: Database, dishId: string) {
  return db.query.dishHistory.findFirst({
    where: eq(dishHistory.id, dishId),
    with: relations,
  });
}

export async function createDish(db: Database, values: typeof dishHistory.$inferInsert) {
  const recipe = await db.query.recipes.findFirst({
    where: eq(recipes.id, values.recipeId),
    with: {
      ingredients: true,
    },
  });

  if (!recipe) {
    throw new NotFoundError('Cannot find recipe', { id: values.recipeId });
  }

  await db.insert(dishHistory).values(values);

  for (const ingredient of recipe.ingredients) {
    await db.insert(ingredients).values({
      id: createId(),
      quantity: ingredient.quantity,
      recipeId: ingredient.recipeId,
      dishHistoryId: values.id,
      productId: ingredient.productId,
    });
  }

  // await db.insert(ingredients).select(
  //   db
  //     .select({
  //       id: sql`create_id()`.as('id'),
  //       quantity: ingredients.quantity,
  //       recipeId: ingredients.recipeId,
  //       dishHistoryId: ingredients.dishHistoryId,
  //       productId: ingredients.productId,
  //     })
  //     .from(ingredients)
  //     .where(isNull(ingredients.dishHistoryId)),
  // );
}

export async function updateDishQuantities(
  db: Database,
  dishId: string,
  { quantities }: { quantities: Array<{ ingredientId: string; quantity: number }> },
) {
  const values = sql.join(
    quantities.map(({ ingredientId, quantity }) => sql`(${ingredientId}, ${quantity}::numeric)`),
    sql.raw(', '),
  );

  await db
    .update(ingredients)
    .set({ quantity: sql.raw('v.quantity') })
    .from(sql`(values ${values}) as v(ingredient_id, quantity)`)
    .where(and(eq(ingredients.dishHistoryId, dishId), eq(ingredients.id, sql.raw('v.ingredient_id'))));
}
