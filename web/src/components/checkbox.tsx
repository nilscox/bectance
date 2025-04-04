import { Checkbox as ArkCheckbox } from '@ark-ui/solid';
import clsx from 'clsx';
import { CheckIcon } from 'lucide-solid';
import { JSX } from 'solid-js';

export function Checkbox(props: {
  label?: JSX.Element;
  disabled?: boolean;
  readOnly?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  class?: string;
  classes?: Partial<Record<'label', string>>;
}) {
  return (
    <ArkCheckbox.Root
      checked={props.checked}
      disabled={props.disabled}
      readOnly={props.readOnly}
      onCheckedChange={(event) => props.onChange?.(Boolean(event.checked))}
      class={clsx('inline-flex flex-row items-center gap-2 group', props.class)}
    >
      <ArkCheckbox.Control class="border rounded size-4 group-data-disabled:opacity-50">
        <ArkCheckbox.Indicator>
          <CheckIcon class="size-full" />
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>

      <ArkCheckbox.HiddenInput />

      <ArkCheckbox.Label class={props.classes?.label}>{props.label}</ArkCheckbox.Label>
    </ArkCheckbox.Root>
  );
}
