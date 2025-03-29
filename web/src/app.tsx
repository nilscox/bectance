import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';

import { ShoppingList } from './shopping-list';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ShoppingList listId="" />
    </QueryClientProvider>
  );
}
