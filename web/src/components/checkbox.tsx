import { Checkbox as ArkCheckbox } from '@ark-ui/solid';
import { CheckIcon } from 'lucide-solid';
import { JSX } from 'solid-js';

export function Checkbox(props: {
  label?: JSX.Element;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <ArkCheckbox.Root
      checked={props.checked}
      onCheckedChange={(event) => props.onChange?.(Boolean(event.checked))}
      class="inline-flex flex-row items-center gap-1"
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
