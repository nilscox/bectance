import { assert } from '@bectance/shared/utils';
import { A, useNavigate } from '@solidjs/router';
import { useMutation, useQuery } from '@tanstack/solid-query';
import { For, createSignal } from 'solid-js';

import { createShoppingList, listShoppingLists } from './api';
import { Button } from './components/button';
import { Dialog } from './components/dialog';
import { Header as BaseHeader } from './components/header';
import { Input } from './components/input';
import { Menu } from './components/menu';
import { EllipsisVerticalIcon, PlusIcon, ShoppingCartIcon } from './icons';

export { Header, Page };

function Header() {
  const [createDialogOpen, setCreateDialogOpen] = createSignal(false);

  return (
    <>
      <BaseHeader
        title="Courses"
        left={
          <span class="p-2">
            <ShoppingCartIcon class="text-dim size-6" />
          </span>
        }
        right={
          <Menu
            trigger={<EllipsisVerticalIcon class="text-dim size-6" />}
            onSelect={{
              create: () => setCreateDialogOpen(true),
            }}
          >
            <Menu.Item value="create" icon={PlusIcon} label="Nouvelle liste" />
          </Menu>
        }
      />

      <CreateShoppingListDialog open={createDialogOpen()} setOpen={setCreateDialogOpen} />
    </>
  );
}

function CreateShoppingListDialog(props: { open: boolean; setOpen: (open: boolean) => void }) {
  const navigate = useNavigate();

  const mutation = useMutation(() => ({
    async mutationFn(name: string) {
      return createShoppingList(name);
    },
    onSuccess(listId) {
      navigate(`/list/${listId}`);
    },
  }));

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    assert(event.target instanceof HTMLFormElement);

    const data = new FormData(event.target);
    const name = data.get('name');

    assert(typeof name === 'string');
    mutation.mutate(name);
  };

  return (
    <Dialog open={props.open} setOpen={(open) => props.setOpen(open)} title="Nouvelle liste de courses">
      <form onSubmit={handleSubmit} class="col gap-4 items-start mt-6">
        <Input name="name" placeholder="Nom de la liste" />
        <Button type="submit">Créer</Button>
      </form>
    </Dialog>
  );
}

function Page() {
  const query = useQuery(() => ({
    queryKey: ['listShoppingLists'],
    queryFn: () => listShoppingLists(),
  }));

  return (
    <section>
      <ul class="list-disc list-inside">
        <For each={query.data}>
          {(list) => (
            <li>
              <A href={`/list/${list.id}`}>{list.name}</A>
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}
