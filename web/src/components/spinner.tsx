import clsx from 'clsx';

export function Spinner(props: { class: string }) {
  return (
    <svg
      role="progressbar"
      viewBox="0 0 24 24"
      fill="none"
      class={clsx('inline-block -rotate-90', props.class)}
    >
      <circle class="stroke-current opacity-30" cx={12} cy={12} r={10} stroke-width={3} />
      <circle
        cx={12}
        cy={12}
        r={10}
        stroke-width={3}
        stroke-linecap="round"
        class="origin-center stroke-current animate-spin"
        style={{
          'stroke-dasharray': Math.PI * (24 - 4),
          'stroke-dashoffset': String(Math.PI * (24 - 4) * 0.7),
        }}
      />
    </svg>
  );
}
