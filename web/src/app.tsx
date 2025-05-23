import { Navigate, Route, Router } from '@solidjs/router';

import { Layout } from './layout';
import * as recipe from './recipe';
import * as recipeList from './recipe-list';
import * as shoppingList from './shopping-list';
import * as shoppingListList from './shopping-lists';

export function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={() => <Navigate href="/list" />} />
      <Route path="/list" component={shoppingListList.Page} />
      <Route path="/list/:listId" component={shoppingList.Page} />
      <Route path="/recipe" component={recipeList.Page} />
      <Route path="/recipe/:recipeId" component={recipe.Page} />
    </Router>
  );
}
