import type { ShoppingList } from '@boubouffe/core';
import { For, createResource, onCleanup, onMount } from 'solid-js';

import { Checkbox } from './components/checkbox';

export function ShoppingList(props: { name: string }) {
  const [list, { onItemChecked }] = useShoppingList(() => props.name);

  return (
    <ul>
      <For each={list.latest?.items}>
        {(item) => (
          <li>
            <Checkbox
              label={item.product.name}
              checked={item.checked}
              onChange={(checked) => onItemChecked(item.product.name, checked)}
            />
          </li>
        )}
      </For>
    </ul>
  );
}

function useShoppingList(getName: () => string) {
  const [list, { mutate }] = createResource(getName, getShoppingList);

  const setItemChecked = (id: string, checked: boolean) => {
    mutate((prev) => {
      if (!prev) {
        return prev;
      }

      const index = prev?.items.findIndex((item) => item.id === id);

      if (index < 0) {
        return prev;
      }

      return {
        ...prev,
        items: [
          ...prev.items.slice(0, index),
          { ...prev.items[index], checked },
          ...prev.items.slice(index + 1),
        ],
      };
    });
  };

  const onItemChecked = async (name: string, checked: boolean) => {
    await checkShoppingListItem(getName(), name, checked);
  };

  onMount(() => {
    const eventSource = new EventSource(`/api/shopping-list/${getName()}/events`);

    eventSource.addEventListener('shoppingListItemUpdated', (event) => {
      const data: { id: string; checked: boolean } = JSON.parse(event.data);

      setItemChecked(data.id, data.checked);
    });

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
    };

    onCleanup(() => {
      eventSource.close();
    });
  });

  return [list, { onItemChecked }] as const;
}

async function getShoppingList(name: string) {
  const response = await fetch(`/api/shopping-list/${name}`);

  if (response.ok) {
    return response.json() as Promise<ShoppingList>;
  }
}

async function checkShoppingListItem(listName: string, productName: string, checked: boolean) {
  await fetch(`/api/shopping-list/${listName}/${productName}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checked }),
  });
}
