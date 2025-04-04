/* @refresh reload */
import 'solid-devtools';

import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { render } from 'solid-js/web';

import { App } from './app';

import '@fontsource-variable/open-sans';
import './index.css';

const queryClient = new QueryClient();

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  ),
  document.getElementById('root') as HTMLElement,
);
