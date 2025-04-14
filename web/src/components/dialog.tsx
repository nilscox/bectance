import { Dialog as ArkDialog } from '@ark-ui/solid';
import { JSX } from 'solid-js';
import { Portal } from 'solid-js/web';

export function Dialog(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <ArkDialog.Root open={props.open} onOpenChange={({ open }) => props.setOpen(open)}>
      <Portal>
        <ArkDialog.Backdrop class="data-[state=open]:fixed data-[state=open]:inset-0 bg-gray-300/50" />
        <ArkDialog.Positioner class="fixed inset-0 flex items-center justify-center p-4">
          <ArkDialog.Content class="bg-white rounded-lg border shadow-md p-4 outline-none w-full max-w-xl">
            <ArkDialog.Title class="text-lg font-medium">{props.title}</ArkDialog.Title>
            {props.children}
          </ArkDialog.Content>
        </ArkDialog.Positioner>
      </Portal>
    </ArkDialog.Root>
  );
}
