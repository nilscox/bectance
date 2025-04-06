import * as dtos from '@bectance/shared/dtos';
import express, { Response } from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

import { mapProduct } from '../product/product.api.js';
import { createRecipe, listRecipes } from './recipe.domain.js';

export const recipe = express.Router();

recipe.get('/', async (req, res: Response<dtos.Recipe[]>) => {
  const recipes = await listRecipes();

  res.json(
    recipes.map(({ ingredients, ...recipe }) => ({
      ...recipe,
      ingredients: ingredients.map(({ product, ...ingredients }) => ({
        ...ingredients,
        product: mapProduct(product),
      })),
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
