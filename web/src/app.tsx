import { Route, Router } from '@solidjs/router';

import { ShoppingList } from './shopping-list';

export function App() {
  return (
    <Router>
      <Route path="/" />
      <Route path="/list/:listId" component={ShoppingList} />
    </Router>
  );
}
