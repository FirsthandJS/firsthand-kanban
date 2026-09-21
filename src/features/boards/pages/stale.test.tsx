/**
 * The list must not be served counts from before a change it never saw.
 *
 * Open the list, walk into a board, change something there, walk back: the
 * list resource did not exist when the invalidation happened, so the only
 * thing that can save it is the store emptying the cache it was handed.
 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, mount } from '@firsthandjs/testing';
import { component, provide, signal } from '@firsthandjs/dom';
import { Router, createMemoryHistory, route } from '@firsthandjs/router';
import { ThemeContext } from '@firsthandjs/styled';
import { DataContext, createData, tag, type DataStore } from '@firsthandjs/data';
import { Boards } from './boards';
import { cache } from '@/shared/api/client';
import { signedIn } from '@/features/session/model';
import { theme } from '@/shared/ui/theme';

const original = globalThis.fetch;
let count = 8;
let sent: string[] = [];

beforeEach(() => {
  sent = [];
  count = 8;
  cache.forget();
  signedIn({ token: 't', account: { id: 'a1', name: 'Ada', email: 'ada@example.com' } });
  globalThis.fetch = ((input: unknown) => {
    const url = String(input);
    sent.push(/Boards/.test(decodeURIComponent(url)) ? 'Boards' : 'other');
    return Promise.resolve(
      new Response(
        JSON.stringify({
          data: { boards: [{ id: 'b1', name: 'Release', summary: 'x', cardCount: count }] },
        }),
      ),
    );
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = original;
  cleanup();
});

/** The list page, mounted and unmounted the way a route does. */
function listing(store: DataStore) {
  const Page = component(() => {
    provide(ThemeContext, signal(theme));
    provide(DataContext, store);
    return (
      <Router
        history={createMemoryHistory(['/'])}
        routes={[route({ path: '/', component: () => <Boards /> })]}
      />
    );
  });
  return mount(() => <Page />);
}

it('reloads after an invalidation it was not there for', async () => {
  // The store the application builds: it is handed the cache.
  const store = createData({ caches: [cache] });

  const first = listing(store);
  await vi.waitFor(() => {
    expect(first.text()).toContain('8');
  });
  expect(sent.filter((one) => one === 'Boards')).toHaveLength(1);
  cleanup();

  // Something two pages away changes what the list is about.
  count = 7;
  await store.invalidate(tag('boards'));

  const second = listing(store);
  await vi.waitFor(() => {
    expect(second.text()).toContain('7');
  });
  expect(sent.filter((one) => one === 'Boards')).toHaveLength(2);
});
