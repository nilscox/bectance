import { Navigate, Route, Router } from '@solidjs/router';

import { Layout } from './layout';
import * as shoppingList from './shopping-list';
import * as shoppingListList from './shopping-lists';

export function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={() => <Navigate href="/list" />} />
      <Route path="/list" component={shoppingListList.Page} />
      <Route path="/list/:listId" component={shoppingList.Page} />
    </Router>
  );
}
