/**
 * Everything this application is set up with, in one place.
 *
 * Three things are application-wide and so are provided here: the theme, the
 * data store, and the routes. There is no provider tower — `provide` is called
 * in the component that owns the value, and `useContext` finds it through the
 * owner tree.
 *
 * Note which of them is *not* here: the cache. It lives beside the client in
 * `shared/api`, because knowing when two requests are the same thing is a
 * transport's job. The store holds resources and matches tags; it has no
 * memory of its own.
 */
import '@/app/devtools';
import '@/app/webawesome';

import { component, provide, render, signal } from '@firsthandjs/dom';
import { Router } from '@firsthandjs/router';
import { DataContext, createData } from '@firsthandjs/data';
import { ThemeContext } from '@firsthandjs/styled';
import { routes } from '@/app/routes';
import { theme } from '@/shared/ui/theme';

const Root = component(() => {
  // A signal, not a constant: assigning a new object restyles everything that
  // reads the theme.
  provide(ThemeContext, signal(theme));
  provide(DataContext, createData());

  return <Router routes={routes} />;
});

render(() => <Root />, document.getElementById('root') as HTMLElement);
