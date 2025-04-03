import { Product, ShoppingList } from '@boubouffe/shared/dtos';

export async function listProducts() {
  const response = await fetch('/api/product');

  if (response.ok) {
    return response.json() as Promise<Product[]>;
  }
}

export async function getShoppingList(listId: string) {
  const response = await fetch(`/api/shopping-list/${listId}`);

  if (response.ok) {
    return response.json() as Promise<ShoppingList>;
  }
}

export async function upsertShoppingListItem(
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
