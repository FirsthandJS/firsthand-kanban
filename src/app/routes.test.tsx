/**
 * The guard, which is the reason `routes.tsx` is written the way it is.
 *
 * A setup runs once, so a check made in one is made for ever — and the bug
 * that would cause is silent: signing out would leave the page it was meant to
 * hide on the screen. The check lives in a render function, which runs again,
 * and this is the test that says so.
 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, mount } from '@firsthandjs/testing';
import { component, provide, signal } from '@firsthandjs/dom';
import { Router, createMemoryHistory } from '@firsthandjs/router';
import { ThemeContext } from '@firsthandjs/styled';
import { DataContext, createData } from '@firsthandjs/data';
import { routes } from '@/app/routes';
import { cache } from '@/shared/api/client';
import { signedIn, signedOut } from '@/features/session/model';
import { theme } from '@/shared/ui/theme';

const original = globalThis.fetch;

beforeEach(() => {
  cache.forget();
  signedOut();
  globalThis.fetch = (() =>
    Promise.resolve(
      new Response(JSON.stringify({ data: { boards: [] } })),
    )) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = original;
  signedOut();
  cleanup();
});

const App = component(() => {
  provide(ThemeContext, signal(theme));
  provide(DataContext, createData());
  return <Router history={createMemoryHistory(['/'])} routes={routes} />;
});

it('sends a signed-out visitor to the sign-in page', async () => {
  const view = mount(() => <App />);
  await vi.waitFor(() => {
    expect(view.text()).toContain('account');
  });
  expect(view.text()).not.toContain('Boards');
});

it('lets a signed-in visitor through, and takes it back on a sign-out', async () => {
  const view = mount(() => <App />);

  signedIn({ token: 't', account: { id: 'a1', name: 'Ada', email: 'ada@example.com' } });
  await vi.waitFor(() => {
    expect(view.all('[data-testid="boards"], h1, h2').length).toBeGreaterThan(0);
  });
  const signedInText = view.text();
  expect(signedInText).not.toContain('Create an account');

  // The half that a check made once could not do.
  signedOut();
  await vi.waitFor(() => {
    expect(view.text()).toContain('account');
  });
});
