import { JSX, Show } from 'solid-js';

export function Header(props: {
  left?: JSX.Element;
  right?: JSX.Element;
  section?: JSX.Element;
  title?: JSX.Element;
}) {
  return (
    <header class="p-2 row gap-4 items-center">
      {props.left}

      <div class="me-auto">
        <Show when={props.section}>
          <div class="text-dim uppercase row gap-1 items-center text-xs font-semibold">{props.section}</div>
        </Show>

        <div class="text-3xl">
          <Show when={props.title} fallback={<wbr />}>
            {props.title}
          </Show>
        </div>
      </div>

      {props.right}
    </header>
  );
}
