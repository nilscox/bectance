import { useQuery } from '@tanstack/solid-query';
import { For } from 'solid-js';

import { listRecipes } from './api';
import { Header as BaseHeader } from './components/header';
import { CookingPotIcon } from './icons';

export { Header, Page };

function Header() {
  return (
    <>
      <BaseHeader
        title="Recettes"
        left={
          <span class="p-2">
            <CookingPotIcon class="text-dim size-6" />
          </span>
        }
      />
    </>
  );
}

function Page() {
  const query = useQuery(() => ({
    queryKey: ['listRecipes'],
    queryFn: () => listRecipes(),
  }));

  return (
    <section>
      <ul class="list-disc list-inside">
        <For each={query.data}>{(recipe) => <li class="truncate">{recipe.name}</li>}</For>
      </ul>
    </section>
  );
}
