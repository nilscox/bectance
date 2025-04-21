import * as dtos from '@bectance/shared/dtos';
import { and, eq } from 'drizzle-orm';

import { NotFoundError } from '../../errors.js';
import { Database, db } from '../../persistence/database.js';
import { Ingredient, Product, ingredients, recipes } from '../../persistence/schema.js';
import { defined } from '../../utils.js';

export async function listRecipes(filters?: { name?: string }) {
  let where = and();

  if (filters?.name !== undefined) {
    where = and(where, eq(recipes.name, filters.name));
  }

  return db.query.recipes.findMany({
    where,
    with: {
      ingredients: {
        with: {
          product: true,
        },
      },
    },
  });
}

export async function getRecipe(recipeId: string) {
  return db.query.recipes.findFirst({
    where: eq(recipes.id, recipeId),
    with: {
      ingredients: {
        with: {
          product: true,
        },
      },
    },
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
  values: {
    id: string;
    recipeId: string;
    productId?: string;
    label?: string;
    unit?: string;
    quantity: number;
  },
) {
  await db.insert(ingredients).values(values);
}

export async function getIngredient(ingredientId: string) {
  const ingredient = await db.query.ingredients.findFirst({
    where: eq(ingredients.id, ingredientId),
    with: { product: true },
  });

  return defined(ingredient, new NotFoundError('Cannot find ingredient', { id: ingredientId }));
}

export function mapIngredient(ingredient: Ingredient & { product: Product | null }): dtos.Ingredient {
  return {
    id: ingredient.id,
    productId: ingredient.product?.id,
    label: ingredient.product?.name ?? defined(ingredient.label),
    unit: ingredient.product?.unit ?? defined(ingredient.unit),
    quantity: ingredient.quantity,
  };
}
