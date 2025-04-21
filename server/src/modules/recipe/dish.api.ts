import * as dtos from '@bectance/shared/dtos';
import express, { Response } from 'express';
import { z } from 'zod';
import { validateRequestBody } from 'zod-express-middleware';

import { db } from '../../persistence/database.js';
import { DishHistory, Ingredient, Product, Recipe } from '../../persistence/schema.js';
import { assert, createId, defined } from '../../utils.js';
import { createDish, getDish, listDish, updateDishQuantities } from './dish.domain.js';
import { mapIngredient } from './recipe.domain.js';

export const dish = express.Router();

function mapDish(
  dish: DishHistory & { recipe: Recipe; ingredients: Array<Ingredient & { product: Product | null }> },
): dtos.Dish {
  return {
    id: dish.id,
    date: dish.date.toString(),
    recipeId: dish.recipeId,
    name: dish.recipe.name,
    ingredients: dish.ingredients.map(mapIngredient),
  };
}

dish.get('/', async (req, res: Response<dtos.Dish[]>) => {
  res.json((await listDish(db)).map(mapDish));
});

const createDishBody = z.object({
  recipeId: z.string(),
});

dish.post('/', validateRequestBody(createDishBody), async (req, res) => {
  const id = createId();
  const recipeId = req.body.recipeId;

  await createDish(db, {
    id,
    date: new Date(),
    recipeId,
  });

  res.status(201).json(mapDish(defined(await getDish(db, id))));
});

const updateDishBody = z.object({
  quantities: z.array(z.object({ ingredientId: z.string(), quantity: z.number() })),
});

dish.put('/:dishId', validateRequestBody(updateDishBody), async (req, res: Response<dtos.Dish>) => {
  assert(req.params.dishId);

  await updateDishQuantities(db, req.params.dishId, { quantities: req.body.quantities });

  res.json(mapDish(defined(await getDish(db, req.params.dishId))));
});
