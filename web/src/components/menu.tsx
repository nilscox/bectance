import { Menu as ArkMenu } from '@ark-ui/solid';
import clsx from 'clsx';
import { EllipsisVerticalIcon } from 'lucide-solid';
import { Component, JSX } from 'solid-js';

type MenuProps = {
  children: JSX.Element;
};

export function Menu(props: MenuProps) {
  return (
    <ArkMenu.Root>
      <ArkMenu.Trigger class="outline-none data-[state=open]:bg-zinc-100 transition-colors rounded p-1">
        {<EllipsisVerticalIcon class="text-dim size-6" />}
      </ArkMenu.Trigger>

      <ArkMenu.Positioner>
        <ArkMenu.Content class="outline-none bg-zinc-100 shadow-md border rounded p-2 max-h-48 overflow-y-auto min-w-48">
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
    <ArkMenu.Item value={props.value} class={clsx('py-1 row gap-2 items-center font-medium', props.class)}>
      <props.icon class="size-4 text-dim" />
      {props.label}
    </ArkMenu.Item>
  );
};
