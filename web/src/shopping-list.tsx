import type { DomainEvents, Product, ShoppingList, ShoppingListItem } from '@boubouffe/shared/dtos';
import { assert, hasProperty } from '@boubouffe/shared/utils';
import { createQuery, useQueryClient } from '@tanstack/solid-query';
import { For, onCleanup, onMount } from 'solid-js';
import { produce } from 'solid-js/store';

import { Checkbox } from './components/checkbox';
import { Combobox } from './components/combobox';

export function ShoppingList(props: { listId: string }) {
  const [getProducts] = useProductList();
  const [getList, { onItemAdded, onItemChecked }] = useShoppingList(() => props.listId);

  return (
    <div class="p-4 col gap-4">
      <div class="text-3xl">{getList()?.name}</div>

      <ul class="space-y-2">
        <For each={getList()?.items}>
          {(item) => (
            <li>
              <Checkbox
                label={item.product.name}
                checked={item.checked}
                onChange={(checked) => onItemChecked(item.product.id, checked)}
              />
            </li>
          )}
        </For>

        <li>
          <Combobox
            items={getProducts() ?? []}
            filter={(product, inputValue) => product.name.toLowerCase().includes(inputValue.toLowerCase())}
            itemToString={(product) => product.name}
            renderItem={(product) => product.name}
            onValueChange={(product) => onItemAdded(product.id)}
          />
        </li>
      </ul>
    </div>
  );
}

function useProductList() {
  const query = createQuery(() => ({
    queryKey: ['listProducts'],
    queryFn: () => listProducts(),
  }));

  return [() => query.data];
}

async function listProducts() {
  const response = await fetch('/api/product');

  if (response.ok) {
    return response.json() as Promise<Product[]>;
  }
}

function useShoppingList(getListId: () => string) {
  const queryClient = useQueryClient();

  const query = createQuery(() => ({
    queryKey: ['getList', getListId()],
    queryFn: () => getShoppingList(getListId()),
  }));

  const updateList = (updater: (list: ShoppingList) => void) => {
    queryClient.setQueryData(['getList', getListId()], (list: ShoppingList | undefined) => {
      if (list) {
        return produce(updater)(list);
      }
    });
  };

  const updateItem = (productId: string, updater: (item: ShoppingListItem) => void) => {
    updateList((list) => {
      const item = list.items.find((item) => item.id === productId);

      assert(item);
      updater(item);
    });
  };

  const onItemAdded = async (productId: string) => {
    await upsertShoppingListItem(getListId(), productId);
  };

  const onItemChecked = async (productId: string, checked: boolean) => {
    await upsertShoppingListItem(getListId(), productId, { checked });
  };

  onMount(() => {
    const eventSource = new EventSource(`/api/shopping-list/${getListId()}/events`);

    eventSource.addEventListener('shoppingListItemUpdated', (event) => {
      const { id, ...data }: DomainEvents['shoppingListItemUpdated'] = JSON.parse(event.data);

      updateItem(id, (item) => {
        Object.assign(item, data);
      });
    });

    eventSource.addEventListener('shoppingListItemCreated', (event) => {
      const data: DomainEvents['shoppingListItemCreated'] = JSON.parse(event.data);

      const products = queryClient.getQueryData<Product[]>(['listProducts']);
      const product = products?.find(hasProperty('id', data.productId));

      if (!product) {
        return;
      }

      updateList((list) => {
        list.items.push({
          id: data.id,
          product,
          checked: data.checked,
          quantity: data.quantity,
        });
      });
    });

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
    };

    onCleanup(() => {
      eventSource.close();
    });
  });

  return [() => query.data, { onItemAdded, onItemChecked }] as const;
}

async function getShoppingList(listId: string) {
  const response = await fetch(`/api/shopping-list/${listId}`);

  if (response.ok) {
    return response.json() as Promise<ShoppingList>;
  }
}

async function upsertShoppingListItem(
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
