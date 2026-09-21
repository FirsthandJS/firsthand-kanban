/**
 * Everything this application is set up with, in one place.
 *
 * Three things are application-wide and so are provided here: the theme, the
 * data store, and the routes. There is no provider tower — `provide` is called
 * in the component that owns the value, and `useContext` finds it through the
 * owner tree.
 *
 * The cache still lives beside the client in `shared/api` — knowing when two
 * requests are the same thing is a transport's job — but the store is handed
 * it, so an invalidation can throw the entries it was about away. The tags on
 * those entries are metadata, never the key.
 */
import '@/app/devtools';
import '@/app/webawesome';

import { component, provide, render, signal } from '@firsthandjs/dom';
import { Router } from '@firsthandjs/router';
import { DataContext, createData } from '@firsthandjs/data';
import { cache } from '@/shared/api/client';
import { ThemeContext } from '@firsthandjs/styled';
import { routes } from '@/app/routes';
import { theme } from '@/shared/ui/theme';

const Root = component(() => {
  // A signal, not a constant: assigning a new object restyles everything that
  // reads the theme.
  provide(ThemeContext, signal(theme));
  // The cache is handed to the store, so an invalidation empties it as well as
  // reloading whatever is watching. Without that, moving a card would leave
  // the board list holding the counts from before the move — nobody is
  // watching that list from inside a board, so the invalidation reaches
  // nothing, and walking back creates a resource rather than reloading one.
  provide(DataContext, createData({ caches: [cache] }));

  return <Router routes={routes} />;
});

render(() => <Root />, document.getElementById('root') as HTMLElement);
