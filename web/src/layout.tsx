import { A } from '@solidjs/router';
import { CookingPotIcon, HouseIcon, ShoppingCartIcon } from 'lucide-solid';
import { JSX } from 'solid-js';

export function Layout(props: { children?: JSX.Element }) {
  return (
    <div class="h-screen col overflow-hidden">
      <main class="p-4 col flex-1 overflow-auto">{props.children}</main>

      <footer class="row justify-evenly border-t">
        <NavLink href="/recipe">
          <CookingPotIcon class="size-6" />
        </NavLink>

        <NavLink href="/list">
          <ShoppingCartIcon class="size-6" />
        </NavLink>

        <NavLink href="/stock">
          <HouseIcon class="size-6" />
        </NavLink>
      </footer>
    </div>
  );
}

function NavLink(props: { href: string; children: JSX.Element }) {
  return (
    <A
      class="size-12 flex items-center justify-center"
      activeClass="text-zinc-800"
      inactiveClass="text-zinc-400"
      {...props}
    />
  );
}
