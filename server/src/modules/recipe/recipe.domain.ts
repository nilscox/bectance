import { and, eq } from 'drizzle-orm';

import { NotFoundError } from '../../errors.js';
import { Database, db } from '../../persistence/database.js';
import { Ingredient, Product, ingredients, recipes } from '../../persistence/schema.js';
import { createId, defined } from '../../utils.js';
import { mapProduct } from '../product/product.api.js';

export async function listRecipes(filters?: { name?: string }) {
  let where = and();

  if (filters?.name !== undefined) {
    where = and(where, eq(recipes.name, filters.name));
  }

  return db.query.recipes.findMany({
    with: {
      ingredients: {
        with: {
          product: true,
        },
      },
    },
    where,
  });
}

export async function createRecipe(
  db: Database,
  { id, name, description }: { id: string; name: string; description: string },
) {
  await db.insert(recipes).values({
    id,
    name,
    description,
  });
}

export async function addIngredient(
  db: Database,
  recipeId: string,
  { id, productId, quantity }: { id: string; productId: string; quantity: number },
) {
  await db.insert(ingredients).values({
    id,
    quantity,
    recipeId,
    productId,
  });
}

export async function getIngredient(ingredientId: string) {
  const ingredient = await db.query.ingredients.findFirst({
    where: eq(ingredients.id, ingredientId),
    with: { product: true },
  });

  return defined(ingredient, new NotFoundError('Cannot find ingredient', { id: ingredientId }));
}

export function mapIngredient(ingredient: Ingredient & { product: Product }) {
  return {
    ...ingredient,
    product: mapProduct(ingredient.product),
  };
}
