import type { DomainEvents, Product, ShoppingList, ShoppingListItem } from '@boubouffe/shared/dtos';
import { assert, hasProperty } from '@boubouffe/shared/utils';
import { createQuery, useQueryClient } from '@tanstack/solid-query';
import { Trash2Icon, XIcon } from 'lucide-solid';
import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { produce } from 'solid-js/store';

import { Checkbox } from './components/checkbox';
import { Combobox } from './components/combobox';
import { useLongPress } from './utils/long-press';

export function ShoppingList(props: { listId: string }) {
  const [getProducts] = useProductList();
  const [getList, { onItemAdded, onItemChecked, onItemDeleted }] = useShoppingList(() => props.listId);
  const [showActions, setShowActions] = createSignal<ShoppingListItem>();

  return (
    <div class="p-4 col gap-4">
      <div class="text-3xl">{getList()?.name}</div>

      <ul>
        <For each={getList()?.items}>
          {(item) => (
            <ShoppingListItem
              item={item}
              showActions={showActions() === item}
              onShowActions={(show: boolean) => setShowActions(show ? item : undefined)}
              onChecked={(checked) => onItemChecked(item.product.id, checked)}
              onDeleted={() => onItemDeleted(item.id)}
            />
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

function ShoppingListItem(props: {
  item: ShoppingListItem;
  showActions: boolean;
  onShowActions: (show: boolean) => void;
  onChecked: (checked: boolean) => void;
  onDeleted: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const longPress = useLongPress(200);

  return (
    <li
      use:longPress={() => props.onShowActions(!props.showActions)}
      class="row gap-4 items-center py-0.5 px-1 rounded"
      classList={{ 'bg-slate-100': props.showActions }}
    >
      <Checkbox
        label={props.item.product.name}
        checked={props.item.checked}
        onChange={(checked) => props.onChecked(checked)}
        class="w-full"
      />

      <Show when={props.showActions}>
        <div class="row gap-2 items-center">
          <button type="button" onClick={() => props.onDeleted()}>
            <Trash2Icon class="size-4" />
          </button>

          <button type="button" onClick={() => props.onShowActions(false)}>
            <XIcon class="size-4" />
          </button>
        </div>
      </Show>
    </li>
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

  const onItemDeleted = async (productId: string) => {
    await deleteShoppingListItem(getListId(), productId);
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

    eventSource.addEventListener('shoppingListItemDeleted', (event) => {
      const data: DomainEvents['shoppingListItemDeleted'] = JSON.parse(event.data);

      updateList((list) => {
        const index = list.items.findIndex(hasProperty('id', data.id));

        if (index >= 0) {
          list.items = [...list.items.slice(0, index), ...list.items.slice(index + 1)];
        }
      });
    });

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
    };

    onCleanup(() => {
      eventSource.close();
    });
  });

  return [() => query.data, { onItemAdded, onItemChecked, onItemDeleted }] as const;
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

async function deleteShoppingListItem(listId: string, itemId: string) {
  await fetch(`/api/shopping-list/${listId}/${itemId}`, {
    method: 'DELETE',
  });
}
