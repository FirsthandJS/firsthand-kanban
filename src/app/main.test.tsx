/**
 * The route guard, which is one line and was wrong once.
 *
 * `token.value` read in a component *body* decides once, because a component
 * runs once — so a sign-out would leave the page it was meant to hide on the
 * screen. Read in a child position it is a part, and the redirect happens.
 * That mistake is invisible until somebody signs out, which is why it is
 * asserted here.
 */
import { afterEach, expect, it } from 'vitest';
import { cleanup, mount } from '@firsthandjs/testing';
import { component, provide, signal } from '@firsthandjs/dom';
import { Router, createMemoryHistory, route } from '@firsthandjs/router';
import { Navigate } from '@firsthandjs/router';
import { ThemeContext } from '@firsthandjs/styled';
import { signedIn, signedOut, token } from '@/features/session/model';
import { theme } from '@/shared/ui/theme';

afterEach(() => {
  signedOut();
  cleanup();
});

/** The guard from `main.tsx`, kept identical on purpose. */
const guarded = (page: () => unknown) => (): unknown => (
  <>{token.value === null ? <Navigate to="/sign-in" replace /> : page()}</>
);

const App = component(() => {
  provide(ThemeContext, signal(theme));
  return (
    <Router
      history={createMemoryHistory(['/'])}
      routes={[
        route({
          path: '/',
          component: guarded(() => <p>the private page</p>) as never,
        }),
        route({ path: '/sign-in', component: () => <p>the sign-in page</p> }),
      ]}
    />
  );
});

it('sends a signed-out visitor to the sign-in page, and keeps a signed-in one', async () => {
  signedIn({
    token: 't',
    account: { id: 'a1', name: 'Ada', email: 'ada@example.com' },
  });
  const view = mount(() => <App />);
  expect(view.text()).toContain('the private page');

  signedOut();
  // The redirect happens in a microtask, because changing the location during
  // the render that produced it would re-enter that render.
  await Promise.resolve();

  expect(view.text()).not.toContain('the private page');
});
