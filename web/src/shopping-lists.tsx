import { A } from '@solidjs/router';
import { useQuery } from '@tanstack/solid-query';
import { ShoppingCartIcon } from 'lucide-solid';
import { For } from 'solid-js';

import { listShoppingLists } from './api';
import { Header as BaseHeader } from './components/header';

export { Header, Page };

function Header() {
  return (
    <BaseHeader
      left={
        <span class="p-2">
          <ShoppingCartIcon class="text-dim size-6" />
        </span>
      }
      title="Courses"
    />
  );
}

function Page() {
  const query = useQuery(() => ({
    queryKey: ['listShoppingLists'],
    queryFn: () => listShoppingLists(),
  }));

  return (
    <div class="col gap-6 mb-6">
      <section>
        <ul class="list-disc list-inside">
          <For each={query.data}>{(list) => <A href={`/list/${list.id}`}>{list.name}</A>}</For>
        </ul>
      </section>
    </div>
  );
}
