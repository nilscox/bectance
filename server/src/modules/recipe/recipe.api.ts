import * as dtos from '@bectance/shared/dtos';
import express, { Response } from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

import { assert, createId, getQueryParam } from '../../utils.js';
import { addIngredient, createRecipe, getIngredient, listRecipes, mapIngredient } from './recipe.domain.js';

export const recipe = express.Router();

recipe.get('/', async (req, res: Response<dtos.Recipe[]>) => {
  const recipes = await listRecipes({ name: getQueryParam(req, 'name') });

  res.json(
    recipes.map(({ ingredients, ...recipe }) => ({
      ...recipe,
      ingredients: ingredients.map(mapIngredient),
    })),
  );
});

const createRecipeBody = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
});

recipe.post('/', validateRequestBody(createRecipeBody), async (req, res) => {
  await createRecipe(req.body);

  res.status(201).end();
});

const addIngredientBody = z.object({
  productId: z.string(),
  quantity: z.number().min(0),
});

recipe.put(
  '/:recipeId',
  validateRequestBody(addIngredientBody),
  async (req, res: Response<dtos.Ingredient>) => {
    assert(req.params.recipeId);

    const id = createId();
    await addIngredient(req.params.recipeId, { id, ...req.body });

    const ingredient = await getIngredient(id);

    res.json(mapIngredient(ingredient));
  },
);
