import type { ShoppingList } from '@boubouffe/core';
import { For, createResource, onCleanup, onMount } from 'solid-js';

import { Checkbox } from './components/checkbox';

export function ShoppingList(props: { name: string }) {
  const list = useShoppingList(() => props.name);

  return (
    <ul>
      <For each={list?.items}>
        {(item) => (
          <li>
            <Checkbox label={item.product.name} checked={item.checked} />
          </li>
        )}
      </For>
    </ul>
  );
}

function useShoppingList(getName: () => string) {
  const [list, { mutate }] = createResource(getName, getShoppingList);

  onMount(() => {
    const eventSource = new EventSource(`/api/shopping-list/${getName()}/events`);

    eventSource.addEventListener('shoppingListItemUpdated', (event) => {
      const data: { id: string; checked: boolean } = JSON.parse(event.data);

      mutate((prev) => {
        if (!prev) {
          return prev;
        }

        const index = prev?.items.findIndex(({ id }) => id === data.id);

        if (index < 0) {
          return prev;
        }

        return {
          ...prev,
          items: [
            ...prev.items.slice(0, index),
            { ...prev.items[index], checked: data.checked },
            ...prev.items.slice(index + 1),
          ],
        };
      });
    });

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
    };

    onCleanup(() => {
      eventSource.close();
    });
  });

  return list.latest;
}

async function getShoppingList(name: string) {
  const response = await fetch(`/api/shopping-list/${name}`);

  if (response.ok) {
    return response.json() as Promise<ShoppingList>;
  }
}
