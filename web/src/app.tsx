import { Route, Router } from '@solidjs/router';

import { Layout } from './layout';
import { ShoppingList } from './shopping-list';
import { ShoppingListList } from './shopping-lists';

export function App() {
  return (
    <Router root={Layout}>
      <Route path="/" />
      <Route path="/list" component={ShoppingListList} />
      <Route path="/list/:listId" component={ShoppingList} />
    </Router>
  );
}
