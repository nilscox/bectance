import * as dtos from '@bectance/shared/dtos';
import express, { Response } from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

import { NotFoundError } from '../../errors.js';
import { db } from '../../persistence/database.js';
import { Ingredient, Product, Recipe } from '../../persistence/schema.js';
import { assert, createId, defined, getQueryParam } from '../../utils.js';
import {
  addIngredient,
  createRecipe,
  getIngredient,
  getRecipe,
  listRecipes,
  mapIngredient,
} from './recipe.domain.js';

export const recipe = express.Router();

function mapRecipe(
  recipe: Recipe & { ingredients: Array<Ingredient & { product: Product | null }> },
): dtos.Recipe {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    ingredients: recipe.ingredients.map(mapIngredient),
  };
}

recipe.get('/', async (req, res: Response<dtos.Recipe[]>) => {
  const recipes = await listRecipes({ name: getQueryParam(req, 'name') });

  res.json(recipes.map(mapRecipe));
});

recipe.get('/:recipeId', async (req, res: Response<dtos.Recipe>) => {
  const recipe = await getRecipe(req.params.recipeId);

  if (!recipe) {
    throw new NotFoundError('Cannot find recipe', { id: req.params.recipeId });
  }

  res.json(mapRecipe(recipe));
});

const createRecipeBody = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
});

recipe.post('/', validateRequestBody(createRecipeBody), async (req, res: Response<dtos.Recipe>) => {
  const id = createId();

  await createRecipe(db, { id, ...req.body });

  const recipe = defined(await getRecipe(id));

  res.status(201).json(mapRecipe(recipe));
});

const addIngredientBody = z.union([
  z.object({
    productId: z.string(),
    quantity: z.number().min(0),
  }),
  z.object({
    label: z.string(),
    unit: z.string(),
    quantity: z.number().min(0),
  }),
]);

recipe.put(
  '/:recipeId',
  validateRequestBody(addIngredientBody),
  async (req, res: Response<dtos.Ingredient>) => {
    assert(req.params.recipeId);

    const id = createId();
    await addIngredient(db, { id, recipeId: req.params.recipeId, ...req.body });

    const ingredient = await getIngredient(id);

    res.json(mapIngredient(ingredient));
  },
);
