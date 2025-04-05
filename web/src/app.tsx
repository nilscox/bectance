import { Route, Router } from '@solidjs/router';

import { Layout } from './layout';
import { ShoppingList } from './shopping-list';

export function App() {
  return (
    <Router root={Layout}>
      <Route path="/" />
      <Route path="/list/:listId" component={ShoppingList} />
    </Router>
  );
}
