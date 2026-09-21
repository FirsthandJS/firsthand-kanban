/**
 * The board page, against a server that answers in this file.
 *
 * `fetch` is replaced and nothing else is: the component, the resources, the
 * actions, urql and the cache all run for real. What is asserted is what a
 * person would see — plus the one thing they would not, which is how many
 * requests it took.
 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, mount } from '@firsthandjs/testing';
import { component, provide, signal } from '@firsthandjs/dom';
import { Router, createMemoryHistory, route } from '@firsthandjs/router';
import { ThemeContext } from '@firsthandjs/styled';
import { DataContext, createData } from '@firsthandjs/data';
import { Board } from '@/features/board/pages/board';
import { cache } from '@/shared/api/client';
import { t } from '@/shared/i18n';
import { signedIn } from '@/features/session/model';
import { theme } from '@/shared/ui/theme';

const original = globalThis.fetch;

/** One board, in the shape the schema describes, mutated by the "server". */
let board = seed();
let sent: string[] = [];
/** Set by the one test that wants the server to say no. */
let refuseEdit = false;

function seed() {
  return {
    id: 'b1',
    name: 'Release 1.0',
    summary: '1 card across 3 columns',
    cardCount: 1,
    columns: [
      {
        id: 'c1',
        name: 'Backlog',
        cards: [{ id: 'k1', title: 'Write the guide', kind: 'CHORE' }],
      },
      {
        id: 'c2',
        name: 'Doing',
        cards: [] as { id: string; title: string; kind: string }[],
      },
      {
        id: 'c3',
        name: 'Done',
        cards: [] as { id: string; title: string; kind: string }[],
      },
    ],
  };
}

/** What was sent, whichever way the client sent it. */
async function operationOf(input: unknown, init: RequestInit | undefined) {
  // urql sends a query as a GET with `?query=…&variables=…`, and a mutation as
  // a POST with a JSON body. A test that knows only one of the two is a test
  // that breaks when the client changes, which is what this project just did.
  const url = input instanceof Request ? input.url : String(input);
  const query = new URL(url, 'https://test.invalid').searchParams;
  if (query.has('query')) {
    return {
      name: /(query|mutation)\s+(\w+)/.exec(query.get('query') ?? '')?.[2] ?? '?',
      variables: JSON.parse(query.get('variables') ?? '{}') as Record<string, unknown>,
    };
  }
  const raw = init?.body ?? (input instanceof Request ? await input.clone().text() : '{}');
  const body = JSON.parse(String(raw)) as {
    query: string;
    variables: Record<string, unknown>;
  };
  return {
    name: /(query|mutation)\s+(\w+)/.exec(body.query)?.[2] ?? '?',
    variables: body.variables,
  };
}

beforeEach(() => {
  sent = [];
  board = seed();
  refuseEdit = false;
  cache.forget();
  signedIn({
    token: 't',
    account: { id: 'a1', name: 'Ada', email: 'ada@example.com' },
  });
  globalThis.fetch = (async (input: unknown, init: RequestInit | undefined) => {
    const { name: operation, variables } = await operationOf(input, init);
    sent.push(operation);

    if (operation === 'MoveCard') {
      const from = board.columns.find((column) => column.cards.length > 0);
      const to = board.columns.find((column) => column.id === variables['toColumnId']);
      const card = from?.cards.pop();
      if (card !== undefined && to !== undefined) {
        to.cards.push(card);
      }
      return Promise.resolve(new Response(JSON.stringify({ data: { moveCard: board } })));
    }
    if (operation === 'EditCard') {
      if (refuseEdit) {
        return Promise.resolve(
          new Response(JSON.stringify({ errors: [{ message: 'Not allowed' }] })),
        );
      }
      const card = board.columns.flatMap((column) => column.cards)[0]!;
      card.title = String(variables['title'] ?? card.title);
      return Promise.resolve(new Response(JSON.stringify({ data: { editCard: card } })));
    }
    if (operation === 'RenameBoard') {
      board.name = String(variables['name']);
      return Promise.resolve(new Response(JSON.stringify({ data: { renameBoard: board } })));
    }
    if (operation === 'DeleteCard') {
      for (const column of board.columns) {
        column.cards = column.cards.filter((card) => card.id !== variables['cardId']);
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

/** The page as the application mounts it: inside a router, because it links. */
const Page = component(() => {
  provide(ThemeContext, signal(theme));
  provide(DataContext, createData());
  return (
    <Router
      history={createMemoryHistory(['/boards/b1'])}
      routes={[
        route({
          path: '/boards/:id',
          component: ({ params }) => <Board id={params.id} />,
        }),
      ]}
    />
  );
});

/** Mounts, and waits for the board to arrive. */
async function open() {
  const view = mount(() => <Page />);
  await vi.waitFor(() => {
    expect(view.text()).toContain('Write the guide');
  });
  return view;
}

it('shows the board, its columns and its cards', async () => {
  const view = await open();
  expect(view.text()).toContain('Backlog');
  expect(view.text()).toContain('Done');
});

it('moves a card with the arrows, and the board reloads because the document said so', async () => {
  const view = await open();

  view.get<HTMLButtonElement>(`button[aria-label="${t('board.moveRight')}"]`).click();

  // Nothing in this test mentions a tag: the mutation's `@invalidates(name:
  // "board", id: $boardId)` does, and an action's request is the store's
  // invalidation.
  await vi.waitFor(() => {
    expect(sent).toContain('MoveCard');
    expect(sent.filter((operation) => operation === 'Board')).toHaveLength(2);
  });
});

it('moves a card by dropping it on another column', async () => {
  const view = await open();
  const card = view.get('[data-card="k1"]');
  const columns = view.all('section');

  card.dispatchEvent(new Event('dragstart', { bubbles: true }));
  columns[1]?.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
  columns[1]?.dispatchEvent(new Event('drop', { bubbles: true }));

  // The drop calls the same mutation the arrow does — dragging is an input
  // method, not a second way of changing anything.
  await vi.waitFor(() => {
    expect(sent).toContain('MoveCard');
  });
});

it('renames a card in place', async () => {
  const view = await open();

  view.get<HTMLButtonElement>(`button[aria-label="${t('board.edit')}"]`).click();
  // A textarea, not an input: a title that wrapped onto three lines must not
  // be squeezed onto one to edit it.
  const field = view.get<HTMLTextAreaElement>('[data-card] textarea');
  field.value = 'Write the reference';
  field.dispatchEvent(new Event('input', { bubbles: true }));
  view.get('[data-card] form').dispatchEvent(new Event('submit', { bubbles: true }));

  await vi.waitFor(() => {
    expect(view.text()).toContain('Write the reference');
  });
});

it('puts the old title back when the rename is refused', async () => {
  refuseEdit = true;
  const view = await open();

  view.get<HTMLButtonElement>(`button[aria-label="${t('board.edit')}"]`).click();
  const field = view.get<HTMLTextAreaElement>('[data-card] textarea');
  field.value = 'Write the reference';
  field.dispatchEvent(new Event('input', { bubbles: true }));
  view.get('[data-card] form').dispatchEvent(new Event('submit', { bubbles: true }));

  // The new title goes up immediately — that is the point of showing it before
  // the server answers — and it has to come down again when the answer is no.
  await vi.waitFor(() => {
    expect(sent).toContain('EditCard');
  });
  await vi.waitFor(() => {
    expect(view.text()).toContain('Write the guide');
  });
  expect(view.text()).not.toContain('Write the reference');
});

it('renames the board from its title', async () => {
  const view = await open();

  view.get<HTMLButtonElement>('button[data-rename]').click();
  const input = view.get<HTMLInputElement>('form input');
  input.value = 'Release 1.1';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  view.get('form').dispatchEvent(new Event('submit', { bubbles: true }));

  await vi.waitFor(() => {
    expect(view.text()).toContain('Release 1.1');
  });
});

it('keeps a multi-line title on more than one line while it is edited', async () => {
  const view = await open();

  view.get<HTMLButtonElement>(`button[aria-label="${t('board.edit')}"]`).click();
  const field = view.get<HTMLTextAreaElement>('[data-card] textarea');

  expect(field.value).toBe('Write the guide');
  // `rows` is the floor; the height is set from the content, which a
  // single-line input has no way of doing.
  expect(field.tagName).toBe('TEXTAREA');
});

it('deletes a card, and it leaves the screen', async () => {
  const view = await open();

  view.get<HTMLButtonElement>(`button[aria-label="${t('board.delete')}"]`).click();

  await vi.waitFor(() => {
    expect(view.text()).not.toContain('Write the guide');
  });
});
