import { db } from '../../persistence/database.js';

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
