import { Combobox as ArkCombobox, createListCollection } from '@ark-ui/solid';
import type { DomainEvents, Product, ShoppingList, ShoppingListItem } from '@bectance/shared/dtos';
import { assert, hasProperty } from '@bectance/shared/utils';
import { A, useParams } from '@solidjs/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/solid-query';
import { For, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { produce } from 'solid-js/store';

import {
  createShoppingListItem,
  deleteShoppingListItem,
  getShoppingList,
  listProducts,
  updateShoppingListItem,
} from './api';
import { Checkbox } from './components/checkbox';
import { Combobox } from './components/combobox';
import { Header as BaseHeader } from './components/header';
import { Menu } from './components/menu';
import { Spinner } from './components/spinner';
import {
  ArchiveIcon,
  CheckIcon,
  ChevronLeftIcon,
  EditIcon,
  EllipsisVerticalIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from './icons';
import { createSearchIndex } from './utils/search';

export { Header, Page };

function Header() {
  const params = useParams<{ listId: string }>();
  const query = useQuery(() => ({
    queryKey: ['getShoppingList', params.listId],
    queryFn: () => getShoppingList(params.listId),
  }));

  return (
    <BaseHeader
      title={query.data?.name}
      left={
        <A href="/list" class="p-1">
          <ChevronLeftIcon class="text-dim size-6" />
        </A>
      }
      right={
        <Menu trigger={<EllipsisVerticalIcon class="text-dim size-6" />} onSelect={{}}>
          <Menu.Item value="" icon={CheckIcon} label="Terminer" />
          <Menu.Item value="" icon={ArchiveIcon} label="Archiver" />
        </Menu>
      }
      section={
        <>
          <ShoppingCartIcon class="size-em mb-0.5" />
          Liste de courses
        </>
      }
    />
  );
}

function Page() {
  const productList = useProductList();

  const params = useParams<{ listId: string }>();
  const query = useQuery(() => ({
    queryKey: ['getShoppingList', params.listId],
    queryFn: () => getShoppingList(params.listId),
  }));

  useShoppingListEventSource(() => params.listId);

  const elements = new Map<ShoppingListItem, HTMLElement>();

  const onHighlight = (item: ShoppingListItem) => {
    const element = elements.get(item);

    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    element?.classList.add('bg-amber-100');
    setTimeout(() => element?.classList.remove('bg-amber-100'), 1000);
  };

  const total = () => {
    return query.data?.items.length;
  };

  const checked = () => {
    return query.data?.items.filter((item) => item.checked).length;
  };

  return (
    <div class="col gap-6 mb-6">
      <section>
        <header class="row justify-between items-center mb-2">
          <h2 class="text-xl font-bold text-dim">Plats</h2>
        </header>

        <ul class="list-disc list-inside">
          <li>Dahl</li>
          <li>Burgers</li>
          <li>Poulet basquaise</li>
          <li>Burritos</li>
        </ul>
      </section>

      <section>
        <header class="row justify-between items-center mb-2">
          <h2 class="text-xl font-bold text-dim">Produits</h2>

          <div class="text-sm text-dim">
            {checked()}/{total()}
          </div>
        </header>

        <ul class="divide-y divide-dim/10">
          <For each={query.data?.items}>
            {(item) => (
              <ShoppingListItem
                ref={(ref) => void elements.set(item, ref)}
                listId={params.listId}
                item={item}
              />
            )}
          </For>

          <li class="row gap-4 items-center py-0.5 px-1 rounded">
            <Checkbox readOnly />
            <AddItemCombobox list={query.data} products={productList.data ?? []} onHighlight={onHighlight} />
          </li>
        </ul>
      </section>
    </div>
  );
}

function AddItemCombobox(props: {
  list?: ShoppingList;
  products: Product[];
  onHighlight: (item: ShoppingListItem) => void;
}) {
  const [products, setProducts] = createSignal(props.products);
  const [value, setValue] = createSignal<string[]>([]);

  createEffect(() => {
    setProducts(props.products);
  });

  const collection = createMemo(() =>
    createListCollection({
      items: products().map((product) => ({
        item: product,
        label: product.name,
        value: product.id,
      })),
    }),
  );

  let inputRef!: HTMLInputElement;

  const addItem = useMutation(() => ({
    mutationFn: async (variables: { productId: string } | { label: string }) => {
      const productId = 'productId' in variables ? variables.productId : undefined;
      const label = 'label' in variables ? variables.label : undefined;

      const product = products().find(hasProperty('id', productId));
      const item = props.list?.items.find(hasProperty('label', product?.name ?? label));

      if (item) {
        props.onHighlight(item);
      } else if (props.list) {
        await createShoppingListItem(props.list?.id, variables);
      }
    },
    onSuccess() {
      setProducts(props.products);
      setValue([]);

      setTimeout(() => {
        inputRef.scrollIntoView({ block: 'center' });
        inputRef.focus();
      }, 0);
    },
  }));

  const [highlightedValue, setHighlightedValue] = createSignal<string | null>(null);

  const search = createSearchIndex(
    () => props.products,
    (product) => product.name,
  );

  return (
    <ArkCombobox.Root
      collection={collection()}
      onInputValueChange={({ inputValue }) => setProducts(search(inputValue))}
      highlightedValue={highlightedValue()}
      onHighlightChange={({ highlightedValue }) => setHighlightedValue(highlightedValue)}
      value={value()}
      onValueChange={({ items, value }) => {
        setValue(value);

        if (items[0]) {
          addItem.mutate({ productId: items[0].value });
        }
      }}
      class="grow"
    >
      <ArkCombobox.Control class="row items-center">
        <ArkCombobox.Input
          ref={inputRef}
          disabled={addItem.isPending}
          placeholder="Ajouter un produit"
          onKeyDown={(event) => {
            const value = event.currentTarget.value;

            if (event.key === 'Enter' && value && !highlightedValue()) {
              event.stopPropagation();
              addItem.mutate({ label: value });
            }
          }}
          class="outline-none w-full"
        />
      </ArkCombobox.Control>

      <Combobox.Dropdown items={collection().items} class="max-h-72" />
    </ArkCombobox.Root>
  );
}

function ShoppingListItem(props: {
  ref: (ref: HTMLLIElement) => void;
  listId: string;
  item: ShoppingListItem;
}) {
  const checkItem = useMutation(() => ({
    mutationFn: async ({ checked }: { checked: boolean }) => {
      await updateShoppingListItem(props.listId, props.item.id, { checked });
    },
  }));

  return (
    <li ref={props.ref} class="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center py-0.5 px-1">
      <Checkbox
        disabled={checkItem.isPending}
        checked={props.item.checked}
        onChange={(checked) => checkItem.mutate({ checked })}
        class="w-full"
      />

      <span class="first-letter:capitalize min-w-32">{props.item.label}</span>

      <span class="text-dim text-sm">{formatQuantity(props.item.quantity, props.item.unit)}</span>

      <div class="row gap-2 items-center">
        <ShoppingListItemMenu listId={props.listId} item={props.item} />
      </div>
    </li>
  );
}

function ShoppingListItemMenu(props: { listId: string; item: ShoppingListItem }) {
  const deleteItem = useMutation(() => ({
    mutationFn: async () => {
      await deleteShoppingListItem(props.listId, props.item.id);
    },
  }));

  return (
    <>
      <Menu
        trigger={<EllipsisVerticalIcon class="text-dim size-4" />}
        onSelect={{
          delete: () => deleteItem.mutate(),
          edit: () => alert('Not implemented'),
        }}
      >
        <Menu.Item value="edit" icon={EditIcon} label="Éditer" />
        <Menu.Item value="delete" icon={deleteItem.isPending ? Spinner : Trash2Icon} label="Supprimer" />
      </Menu>
    </>
  );
}

export function formatQuantity(quantity?: number, unit?: string) {
  if (!quantity || !unit) {
    return '';
  }

  if (unit === 'unit') {
    return quantity;
  }

  if (unit === 'liter') {
    if (quantity < 1) {
      return `${quantity * 1000}mL`;
    }

    return `${quantity}L`;
  }

  if (unit === 'gram') {
    if (quantity >= 1000) {
      return `${quantity / 1000}Kg`;
    }

    return `${quantity}g`;
  }

  return `${quantity}${unit}`;
}

function useProductList() {
  return useQuery(() => ({
    queryKey: ['listProducts'],
    queryFn: () => listProducts(),
  }));
}

function useUpdateList() {
  const queryClient = useQueryClient();

  return (listId: string, updater: (list: ShoppingList) => void) => {
    queryClient.setQueryData(['getShoppingList', listId], (list: ShoppingList | undefined) => {
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
  const queryClient = useQueryClient();

  const updateList = useUpdateList();
  const updateItem = useUpdateListItem();

  let eventSource: EventSource;

  const reconnectTimeouts = [0, 500, 1_000, 2_000, 5_000];
  let reconnectTimeoutIndex = -1;

  const connect = () => {
    eventSource = new EventSource(`/api/shopping-list/${getListId()}/events`);

    eventSource.onopen = () => {
      reconnectTimeoutIndex = -1;
      queryClient.invalidateQueries({ queryKey: ['getShoppingList', getListId()] });
    };

    eventSource.addEventListener('shoppingListItemUpdated', (event) => {
      const { id, ...data }: DomainEvents['shoppingListItemUpdated'] = JSON.parse(event.data);

      updateItem(getListId(), id, (item) => {
        Object.assign(item, data);
      });
    });

    eventSource.addEventListener('shoppingListItemCreated', (event) => {
      const data: DomainEvents['shoppingListItemCreated'] = JSON.parse(event.data);

      updateList(getListId(), (list) => {
        list.items.push({
          id: data.id,
          label: data.label,
          checked: data.checked,
          quantity: data.quantity,
          unit: data.unit,
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
      eventSource.close();

      const timeout = reconnectTimeouts[++reconnectTimeoutIndex];

      if (timeout !== undefined) {
        setTimeout(connect, timeout);
      } else {
        alert('Event stream disconnected');
      }
    };
  };

  onMount(() => {
    connect();

    onCleanup(() => {
      eventSource.close();
    });
  });
}
