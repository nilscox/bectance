import { db } from '../../persistence/database.js';
import { recipes } from '../../persistence/schema.js';
import { createId } from '../../utils.js';

export async function listRecipes() {
  return db.query.recipes.findMany({
    with: {
      ingredients: {
        with: {
          product: true,
        },
      },
    },
  });
}

export async function createRecipe({ name, description }: { name: string; description: string }) {
  await db.insert(recipes).values({
    id: createId(),
    name,
    description,
  });
}
