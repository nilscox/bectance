import type { DomainEvents, ShoppingList, ShoppingListItem } from '@boubouffe/shared/dtos';
import { assert, hasProperty } from '@boubouffe/shared/utils';
import { createMutation, createQuery, useQueryClient } from '@tanstack/solid-query';
import { Trash2Icon, XIcon } from 'lucide-solid';
import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { produce } from 'solid-js/store';
import { Dynamic } from 'solid-js/web';

import { deleteShoppingListItem, getShoppingList, listProducts, upsertShoppingListItem } from './api';
import { Checkbox } from './components/checkbox';
import { Combobox } from './components/combobox';
import { Spinner } from './components/spinner';
import { useLongPress } from './utils/long-press';

export function ShoppingList(props: { listId: string }) {
  const productList = useProductList();

  const query = createQuery(() => ({
    queryKey: ['getList', props.listId],
    queryFn: () => getShoppingList(props.listId),
  }));

  useShoppingListEventSource(() => props.listId);

  const addItem = createMutation(() => ({
    mutationFn: ({ productId }: { productId: string }) => upsertShoppingListItem(props.listId, productId),
  }));

  const [showActions, setShowActions] = createSignal<ShoppingListItem>();

  return (
    <div class="p-4 col gap-4">
      <div class="text-3xl">{query.data?.name}</div>

      <ul>
        <For each={query.data?.items}>
          {(item) => (
            <ShoppingListItem
              listId={props.listId}
              item={item}
              showActions={showActions() === item}
              onShowActions={(show: boolean) => setShowActions(show ? item : undefined)}
            />
          )}
        </For>

        <li>
          <Combobox
            items={productList.data ?? []}
            filter={(product, inputValue) => product.name.toLowerCase().includes(inputValue.toLowerCase())}
            itemToString={(product) => product.name}
            renderItem={(product) => product.name}
            onValueChange={(product) => addItem.mutate({ productId: product.id })}
          />
          {addItem.isPending && <>pending</>}
        </li>
      </ul>
    </div>
  );
}

function ShoppingListItem(props: {
  listId: string;
  item: ShoppingListItem;
  showActions: boolean;
  onShowActions: (show: boolean) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const longPress = useLongPress(200);

  const checkItem = createMutation(() => ({
    mutationFn: async ({ checked }: { checked: boolean }) => {
      await upsertShoppingListItem(props.listId, props.item.product.id, { checked });
    },
  }));

  const deleteItem = createMutation(() => ({
    mutationFn: async () => {
      await deleteShoppingListItem(props.listId, props.item.id);
    },
  }));

  return (
    <li
      use:longPress={() => props.onShowActions(!props.showActions)}
      class="row gap-4 items-center py-0.5 px-1 rounded"
      classList={{ 'bg-slate-100': props.showActions }}
    >
      <Checkbox
        label={
          <>
            {props.item.product.name}
            {checkItem.isPending && <Spinner class="size-em ms-2 py-px" />}
          </>
        }
        disabled={checkItem.isPending}
        checked={props.item.checked}
        onChange={(checked) => checkItem.mutate({ checked })}
        class="w-full"
      />

      <Show when={props.showActions}>
        <div class="row gap-2 items-center">
          <button type="button" disabled={deleteItem.isPending} onClick={() => deleteItem.mutate()}>
            <Dynamic component={!deleteItem.isPending ? Trash2Icon : Spinner} class="size-4" />
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
  return createQuery(() => ({
    queryKey: ['listProducts'],
    queryFn: () => listProducts(),
  }));
}

function useUpdateList() {
  const queryClient = useQueryClient();

  return (listId: string, updater: (list: ShoppingList) => void) => {
    queryClient.setQueryData(['getList', listId], (list: ShoppingList | undefined) => {
      if (list) {
        return produce(updater)(list);
      }
    });
  };
}

function useUpdateListItem() {
  const updateList = useUpdateList();

  return (listId: string, productId: string, updater: (item: ShoppingListItem) => void) => {
    updateList(listId, (list) => {
      const item = list.items.find((item) => item.id === productId);

      assert(item);
      updater(item);
    });
  };
}

function useShoppingListEventSource(getListId: () => string) {
  const productList = useProductList();

  const updateList = useUpdateList();
  const updateItem = useUpdateListItem();

  onMount(() => {
    const eventSource = new EventSource(`/api/shopping-list/${getListId()}/events`);

    eventSource.addEventListener('shoppingListItemUpdated', (event) => {
      const { id, ...data }: DomainEvents['shoppingListItemUpdated'] = JSON.parse(event.data);

      updateItem(getListId(), id, (item) => {
        Object.assign(item, data);
      });
    });

    eventSource.addEventListener('shoppingListItemCreated', (event) => {
      const data: DomainEvents['shoppingListItemCreated'] = JSON.parse(event.data);
      const product = productList.data?.find(hasProperty('id', data.productId));

      if (!product) {
        return;
      }

      updateList(getListId(), (list) => {
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

      updateList(getListId(), (list) => {
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
}
