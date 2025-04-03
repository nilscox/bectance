import { Field as ArkField } from '@ark-ui/solid';
import { JSX, Show, splitProps } from 'solid-js';

type InputProps = {
  label?: JSX.Element;
  helperText?: JSX.Element;
  errorText?: JSX.Element;
} & JSX.IntrinsicElements['input'];

export function Input(props: InputProps) {
  const [ownProps, inputProps] = splitProps(props, ['label', 'helperText', 'errorText']);

  return (
    <ArkField.Root>
      <Show when={ownProps.label}>
        <ArkField.Label>{ownProps.label}</ArkField.Label>
      </Show>

      <ArkField.Input {...inputProps} class="border rounded px-2 py-1" />

      <Show when={ownProps.helperText}>
        <ArkField.HelperText>{ownProps.helperText}</ArkField.HelperText>
      </Show>

      <Show when={ownProps.errorText}>
        <ArkField.ErrorText>{ownProps.errorText}</ArkField.ErrorText>
      </Show>
    </ArkField.Root>
  );
}
