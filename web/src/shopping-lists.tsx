import { A } from '@solidjs/router';
import { useQuery } from '@tanstack/solid-query';
import { For } from 'solid-js';

import { listShoppingLists } from './api';

export function ShoppingListList() {
  const query = useQuery(() => ({
    queryKey: ['listShoppingLists'],
    queryFn: () => listShoppingLists(),
  }));

  return (
    <div class="col gap-6 mb-6">
      <div class="text-3xl">Listes de courses</div>

      <section>
        <ul class="list-disc list-inside">
          <For each={query.data}>{(list) => <A href={`/list/${list.id}`}>{list.name}</A>}</For>
        </ul>
      </section>
    </div>
  );
}
