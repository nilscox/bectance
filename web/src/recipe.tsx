import { A, useParams } from '@solidjs/router';
import { useQuery } from '@tanstack/solid-query';
import { For } from 'solid-js';

import { getRecipe } from './api';
import { Header as BaseHeader } from './components/header';
import { ChevronLeftIcon, CookingPotIcon } from './icons';
import { formatLabel, formatQuantity } from './utils/format-quantity';

export { Header, Page };

function Header() {
  const params = useParams<{ recipeId: string }>();
  const query = useQuery(() => ({
    queryKey: ['getRecipe', params.recipeId],
    queryFn: () => getRecipe(params.recipeId),
  }));

  return (
    <BaseHeader
      title={query.data?.name}
      left={
        <A href="/recipe" class="p-1">
          <ChevronLeftIcon class="text-dim size-6" />
        </A>
      }
      section={
        <>
          <CookingPotIcon class="size-em mb-0.5" />
          Recettes
        </>
      }
    />
  );
}

function Page() {
  const params = useParams<{ recipeId: string }>();

  const query = useQuery(() => ({
    queryKey: ['getRecipe', params.recipeId],
    queryFn: () => getRecipe(params.recipeId),
  }));

  return (
    <div class="col gap-6 mb-6">
      <section>
        <header class="row justify-between items-center mb-2">
          <h2 class="text-xl font-bold text-dim">Ingrédients</h2>
        </header>

        <div class="grid grid-cols-[auto_1fr] gap-x-3">
          <For each={query.data?.ingredients}>
            {(ingredient) => (
              <>
                <div class="text-dim text-end">{formatQuantity(ingredient.quantity, ingredient.unit)}</div>
                <div>{formatLabel(ingredient.quantity, ingredient.label, ingredient.labelPlural)}</div>
              </>
            )}
          </For>
        </div>
      </section>

      <section>
        <header class="row justify-between items-center mb-2">
          <h2 class="text-xl font-bold text-dim">Préparation</h2>
        </header>

        <div class="prose">
          <For each={query.data?.description.split('\n')}>{(content) => <p>{content}</p>}</For>
        </div>
      </section>
    </div>
  );
}
