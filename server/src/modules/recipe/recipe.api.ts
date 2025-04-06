import * as dtos from '@bectance/shared/dtos';
import express, { Response } from 'express';

import { mapProduct } from '../product/product.api.js';
import { listRecipes } from './recipe.domain.js';

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
