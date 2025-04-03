import { onCleanup } from 'solid-js';

declare module 'solid-js' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface Directives {
      longPress: () => void;
    }
  }
}

export function useLongPress(time: number) {
  return (element: HTMLElement, cb: () => () => void) => {
    let timeout: number | null = null;
    let longPressed = false;

    const onTouchStart = () => {
      cleanupTimeout();

      timeout = setTimeout(() => {
        longPressed = true;
        cb()();
      }, time);
    };

    const onTouchEnd = (event: TouchEvent) => {
      cleanupTimeout();

      if (longPressed) {
        event.preventDefault();
        longPressed = false;
      }
    };

    const cleanupTimeout = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };

    element.addEventListener('touchstart', onTouchStart);
    element.addEventListener('touchend', onTouchEnd);
    element.addEventListener('touchcancel', cleanupTimeout);

    onCleanup(() => {
      cleanupTimeout();
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchcancel', cleanupTimeout);
    });
  };
}
