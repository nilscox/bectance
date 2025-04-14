import { JSX } from 'solid-js';

export function Button(props: JSX.IntrinsicElements['button']) {
  return <button {...props} class="border rounded px-2 py-1" />;
}
