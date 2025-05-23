import { Product, Recipe, ShoppingList } from '@bectance/shared/dtos';

export async function listProducts() {
  const response = await fetch('/api/product');

  if (response.ok) {
    return response.json() as Promise<Product[]>;
  }
}

export async function listShoppingLists() {
  const response = await fetch(`/api/shopping-list`);

  if (response.ok) {
    return response.json() as Promise<ShoppingList[]>;
  }
}

export async function getShoppingList(listId: string) {
  const response = await fetch(`/api/shopping-list/${listId}`);

  if (response.ok) {
    return response.json() as Promise<ShoppingList>;
  }
}

export async function createShoppingList(name: string) {
  const response = await fetch(`/api/shopping-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  return response.text();
}

export async function createShoppingListItem(
  listId: string,
  param: { productId: string } | { label: string },
  body: Partial<{ checked: boolean; quantity: boolean }> = {},
) {
  await fetch(`/api/shopping-list/${listId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...param, ...body }),
  });
}

export async function updateShoppingListItem(
  listId: string,
  productId: string,
  body: Partial<{ checked: boolean; quantity: boolean }> = {},
) {
  await fetch(`/api/shopping-list/${listId}/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function deleteShoppingListItem(listId: string, itemId: string) {
  await fetch(`/api/shopping-list/${listId}/${itemId}`, {
    method: 'DELETE',
  });
}

export async function listRecipes() {
  const response = await fetch('/api/recipe');

  if (response.ok) {
    return response.json() as Promise<Recipe[]>;
  }
}

export async function getRecipe(recipeId: string) {
  const response = await fetch(`/api/recipe/${recipeId}`);

  if (response.ok) {
    return response.json() as Promise<Recipe>;
  }
}
