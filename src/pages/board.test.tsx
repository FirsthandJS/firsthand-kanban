/**
 * The board page, against a server that answers in this file.
 *
 * `fetch` is replaced and nothing else is: the component, the resources, the
 * actions, the GraphQL client and the cache all run for real. What is asserted
 * is what a person would see, plus the one thing they would not — how many
 * requests it took.
 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, mount } from '@firsthandjs/testing';
import { component, provide, signal } from '@firsthandjs/dom';
import { ThemeContext } from '@firsthandjs/styled';
import { Router, createMemoryHistory, route } from '@firsthandjs/router';
import { DataContext, createData } from '@firsthandjs/data';
import { Board } from './board';
import { cache } from '../setup/api';
import { signedIn } from '../setup/session';
import { theme } from '../setup/theme';

const original = globalThis.fetch;

/** One board, in the shape the schema describes, mutated by the "server". */
const board = {
  id: 'b1',
  name: 'Release 1.0',
  summary: '1 card across 3 columns',
  cardCount: 1,
  columns: [
    { id: 'c1', name: 'Backlog', cards: [{ id: 'k1', title: 'Write the guide', kind: 'CHORE' }] },
    { id: 'c2', name: 'Doing', cards: [] },
    { id: 'c3', name: 'Done', cards: [] },
  ],
};

let sent: string[] = [];

beforeEach(() => {
  sent = [];
  cache.forget();
  signedIn({ token: 't', account: { id: 'a1', name: 'Ada', email: 'ada@example.com' } });
  globalThis.fetch = ((_input: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body)) as { query: string; variables: Record<string, unknown> };
    const operation = /(query|mutation)\s+(\w+)/.exec(body.query)?.[2] ?? '?';
    sent.push(operation);

    if (operation === 'MoveCard') {
      const from = board.columns.find((column) => column.cards.length > 0);
      const to = board.columns.find((column) => column.id === body.variables['toColumnId']);
      const card = from?.cards.pop();
      if (card !== undefined && to !== undefined) {
        to.cards.push(card);
      }
      return Promise.resolve(new Response(JSON.stringify({ data: { moveCard: board } })));
    }
    if (operation === 'DeleteCard') {
      for (const column of board.columns) {
        column.cards = column.cards.filter((card) => card.id !== body.variables['cardId']);
      }
      return Promise.resolve(new Response(JSON.stringify({ data: { deleteCard: 'k1' } })));
    }
    return Promise.resolve(new Response(JSON.stringify({ data: { board } })));
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = original;
  cleanup();
});

/**
 * The page as the application mounts it: inside a router, because it links.
 * A memory history is the whole of what that costs in a test.
 */
const Page = component(() => {
  // What `main.tsx` provides, provided here: a card reads the theme for the
  // colour of its kind.
  provide(ThemeContext, signal(theme));
  provide(DataContext, createData());
  return (
    <Router
      history={createMemoryHistory(['/boards/b1'])}
      routes={[
        route({ path: '/boards/:id', component: ({ params }) => <Board id={params.id} /> }),
      ]}
    />
  );
});

it('shows the board, its columns and its cards', async () => {
  const view = mount(() => <Page />);

  await vi.waitFor(() => {
    expect(view.text()).toContain('Write the guide');
  });
  expect(view.text()).toContain('Backlog');
  expect(view.text()).toContain('Done');
});

it('moves a card, and the board reloads because the document said so', async () => {
  const view = mount(() => <Page />);
  await vi.waitFor(() => {
    expect(view.text()).toContain('Write the guide');
  });

  // The arrow on the card. Nothing in this test mentions a tag: the mutation's
  // `@invalidates(name: "board", id: $boardId)` does, and an action's request
  // is the store's invalidation.
  view.get<HTMLButtonElement>('button[aria-label="Move right"]').click();

  await vi.waitFor(() => {
    expect(sent).toContain('MoveCard');
    // The mutation, then the board again — forced, so the ten-second cache
    // does not answer it.
    expect(sent.filter((operation) => operation === 'Board')).toHaveLength(2);
  });
});

it('deletes a card, and it leaves the screen', async () => {
  const view = mount(() => <Page />);
  await vi.waitFor(() => {
    expect(view.text()).toContain('Write the guide');
  });

  view.get<HTMLButtonElement>('button[aria-label="Delete card"]').click();

  await vi.waitFor(() => {
    expect(view.text()).not.toContain('Write the guide');
  });
});
