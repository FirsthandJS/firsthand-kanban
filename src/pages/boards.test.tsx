/**
 * The board list, and the thing worth asserting about it: that creating a
 * board reloads the list without the form saying so.
 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, mount } from '@firsthandjs/testing';
import { component, provide, signal } from '@firsthandjs/dom';
import { Router, createMemoryHistory, route } from '@firsthandjs/router';
import { ThemeContext } from '@firsthandjs/styled';
import { DataContext, createData } from '@firsthandjs/data';
import { Boards } from './boards';
import { cache } from '../setup/api';
import { signedIn } from '../setup/session';
import { theme } from '../setup/theme';

const original = globalThis.fetch;
const boards = [{ id: 'b1', name: 'Release 1.0', summary: 'empty', cardCount: 0 }];
let sent: string[] = [];

beforeEach(() => {
  sent = [];
  boards.length = 1;
  cache.forget();
  signedIn({ token: 't', account: { id: 'a1', name: 'Ada', email: 'ada@example.com' } });
  globalThis.fetch = ((_input: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body)) as {
      query: string;
      variables: Record<string, unknown>;
    };
    const operation = /(query|mutation)\s+(\w+)/.exec(body.query)?.[2] ?? '?';
    sent.push(operation);
    if (operation === 'CreateBoard') {
      const made = {
        id: `b${String(boards.length + 1)}`,
        name: String(body.variables['name']),
        summary: 'empty',
        cardCount: 0,
      };
      boards.push(made);
      return Promise.resolve(new Response(JSON.stringify({ data: { createBoard: made } })));
    }
    return Promise.resolve(new Response(JSON.stringify({ data: { boards } })));
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = original;
  cleanup();
});

const Page = component(() => {
  provide(ThemeContext, signal(theme));
  provide(DataContext, createData());
  return (
    <Router
      history={createMemoryHistory(['/'])}
      routes={[route({ path: '/', component: () => <Boards /> })]}
    />
  );
});

it('lists the boards', async () => {
  const view = mount(() => <Page />);

  await vi.waitFor(() => {
    expect(view.text()).toContain('Release 1.0');
  });
});

it('creates one, and the list reloads because the document invalidates it', async () => {
  const view = mount(() => <Page />);
  await vi.waitFor(() => {
    expect(view.text()).toContain('Release 1.0');
  });

  const input = view.get<HTMLInputElement>('wa-input');
  input.value = 'Roadmap';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  view.get<HTMLFormElement>('form').dispatchEvent(new Event('submit', { bubbles: true }));

  // Nothing in this component mentions `boards`: the mutation's own
  // `@invalidates(name: "boards")` does, and the action's request is the
  // store's invalidation.
  await vi.waitFor(() => {
    expect(view.text()).toContain('Roadmap');
  });
  expect(sent.filter((operation) => operation === 'Boards')).toHaveLength(2);
});
