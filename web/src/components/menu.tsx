import { Menu as ArkMenu } from '@ark-ui/solid';
import clsx from 'clsx';
import { Component, JSX } from 'solid-js';

type MenuProps = {
  onSelect: Record<string, () => void>;
  trigger: JSX.Element;
  children: JSX.Element;
};

export function Menu(props: MenuProps) {
  return (
    <ArkMenu.Root onSelect={({ value }) => props.onSelect[value]?.()}>
      <ArkMenu.Trigger class="outline-none data-[state=open]:bg-zinc-100 transition-colors rounded p-1 cursor-pointer">
        {props.trigger}
      </ArkMenu.Trigger>

      <ArkMenu.Positioner>
        <ArkMenu.Content class="outline-none bg-zinc-100 shadow-md border rounded px-1.5 py-1 divide-y max-h-48 overflow-y-auto min-w-48 text-sm">
          {props.children}
        </ArkMenu.Content>
      </ArkMenu.Positioner>
    </ArkMenu.Root>
  );
}

Menu.Item = function (props: {
  value: string;
  icon: Component<{ class: string }>;
  label: JSX.Element;
  class?: string;
}) {
  return (
    <ArkMenu.Item
      value={props.value}
      class={clsx('py-1.5 row gap-2 items-center font-medium cursor-pointer', props.class)}
    >
      <props.icon class="size-4 text-dim" />
      {props.label}
    </ArkMenu.Item>
  );
};
