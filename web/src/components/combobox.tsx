import {
  Combobox as ArkCombobox,
  Field as ArkField,
  ComboboxInputValueChangeDetails,
  ComboboxValueChangeDetails,
  createListCollection,
} from '@ark-ui/solid';
import clsx from 'clsx';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, XIcon } from 'lucide-solid';
import { For, JSX, Show, createEffect, createMemo, createSignal } from 'solid-js';
import { Portal } from 'solid-js/web';

type ComboboxProps<T> = {
  label?: JSX.Element;
  placeholder?: string;
  helperText?: JSX.Element;
  errorText?: JSX.Element;
  items: T[];
  filter: (item: T, inputValue: string) => void;
  itemToString: (item: T) => string;
  renderItem: (item: T) => JSX.Element;
  onValueChange?: (item: T) => void;
};

export function Combobox<T>(props: ComboboxProps<T>) {
  const [items, setItems] = createSignal(props.items);

  createEffect(() => {
    setItems(props.items);
  });

  const collection = createMemo(() =>
    createListCollection({
      items: items().map((item) => ({
        item,
        label: props.renderItem(item),
        value: props.itemToString(item),
      })),
    }),
  );

  const handleInputChange = (details: ComboboxInputValueChangeDetails) => {
    setItems(props.items.filter((item) => props.filter(item, details.inputValue)));
  };

  const handleValueChange = (details: ComboboxValueChangeDetails<{ item: T }>) => {
    const [item] = details.items;

    if (item) {
      props.onValueChange?.(item.item);
    }

    setItems(props.items);
  };

  return (
    <ArkField.Root>
      <ArkCombobox.Root
        collection={collection()}
        onInputValueChange={handleInputChange}
        onValueChange={handleValueChange}
      >
        <Show when={props.label}>
          <ArkCombobox.Label>{props.label}</ArkCombobox.Label>
        </Show>

        <ArkCombobox.Control class="px-2 py-1 border rounded inline-flex flex-row items-center">
          <ArkCombobox.Input placeholder={props.placeholder} class="outline-none" />

          <ArkCombobox.ClearTrigger>
            <XIcon class="size-4" />
          </ArkCombobox.ClearTrigger>

          <ArkCombobox.Trigger class="group">
            <ChevronUpIcon class="size-5 group-data-[state=closed]:hidden" />
            <ChevronDownIcon class="size-5 group-data-[state=open]:hidden" />
          </ArkCombobox.Trigger>
        </ArkCombobox.Control>

        <Combobox.Dropdown items={collection().items} />
      </ArkCombobox.Root>

      <Show when={props.helperText}>
        <ArkField.HelperText>{props.helperText}</ArkField.HelperText>
      </Show>

      <Show when={props.errorText}>
        <ArkField.ErrorText>{props.errorText}</ArkField.ErrorText>
      </Show>
    </ArkField.Root>
  );
}

Combobox.Dropdown = function <Item>(props: {
  items: Array<{ label: JSX.Element; item: Item }>;
  class?: string;
}) {
  return (
    <Portal>
      <ArkCombobox.Positioner>
        <ArkCombobox.Content
          class={clsx('bg-zinc-100 shadow-md border rounded p-2 max-h-48 overflow-y-auto', props.class)}
        >
          <For each={props.items}>
            {(item) => (
              <ArkCombobox.Item item={item} class="row justify-between items-center">
                <ArkCombobox.ItemText class="data-highlighted:font-semibold">
                  {item.label}
                </ArkCombobox.ItemText>

                <ArkCombobox.ItemIndicator>
                  <CheckIcon class="size-4" />
                </ArkCombobox.ItemIndicator>
              </ArkCombobox.Item>
            )}
          </For>
        </ArkCombobox.Content>
      </ArkCombobox.Positioner>
    </Portal>
  );
};
