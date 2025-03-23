import type { ShoppingList } from '@boubouffe/core';
import { For, createResource } from 'solid-js';

export function App() {
  return <ShoppingList name="next" />;
}

async function getShoppingList(name: string) {
  const response = await fetch(`/api/shopping-list/${name}`);

  if (response.ok) {
    return response.json() as Promise<ShoppingList>;
  }
}

function ShoppingList(props: { name: string }) {
  const [list] = createResource(() => getShoppingList(props.name));

  return (
    <ul>
      <For each={list.latest?.items}>{(item) => <li>{item.product.name}</li>}</For>
    </ul>
  );
}
