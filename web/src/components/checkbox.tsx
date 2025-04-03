import { Checkbox as ArkCheckbox } from '@ark-ui/solid';
import clsx from 'clsx';
import { CheckIcon } from 'lucide-solid';
import { JSX } from 'solid-js';

export function Checkbox(props: {
  label?: JSX.Element;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  class?: string;
}) {
  return (
    <ArkCheckbox.Root
      checked={props.checked}
      onCheckedChange={(event) => props.onChange?.(Boolean(event.checked))}
      class={clsx('inline-flex flex-row items-center gap-2', props.class)}
    >
      <ArkCheckbox.Control class="border rounded size-4">
        <ArkCheckbox.Indicator>
          <CheckIcon class="size-full" />
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      <ArkCheckbox.HiddenInput />
      <ArkCheckbox.Label>{props.label}</ArkCheckbox.Label>
    </ArkCheckbox.Root>
  );
}
