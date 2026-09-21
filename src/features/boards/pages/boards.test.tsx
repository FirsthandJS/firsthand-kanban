/**
 * The board list: the two things it does, and the one worth asserting —
 * creating a board reloads the list without the form saying so.
 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, mount } from '@firsthandjs/testing';
import { component, provide, signal } from '@firsthandjs/dom';
import { Router, createMemoryHistory, route } from '@firsthandjs/router';
import { ThemeContext } from '@firsthandjs/styled';
import { DataContext, createData } from '@firsthandjs/data';
import { Boards } from '@/features/boards/pages/boards';
import { cache } from '@/shared/api/client';
import { t } from '@/shared/i18n';
import { signedIn } from '@/features/session/model';
import { theme } from '@/shared/ui/theme';

const original = globalThis.fetch;
let boards = [{ id: 'b1', name: 'Release 1.0', summary: 'empty', cardCount: 0 }];
let sent: string[] = [];

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
  boards = [{ id: 'b1', name: 'Release 1.0', summary: 'empty', cardCount: 0 }];
  cache.forget();
  signedIn({
    token: 't',
    account: { id: 'a1', name: 'Ada', email: 'ada@example.com' },
  });
  globalThis.fetch = (async (input: unknown, init: RequestInit | undefined) => {
    const { name: operation, variables } = await operationOf(input, init);
    sent.push(operation);
    if (operation === 'CreateBoard') {
      const made = {
        id: `b${String(boards.length + 1)}`,
        name: String(variables['name']),
        summary: 'empty',
        cardCount: 0,
      };
      boards.push(made);
      return Promise.resolve(new Response(JSON.stringify({ data: { createBoard: made } })));
    }
    if (operation === 'RenameBoard') {
      const found = boards.find((board) => board.id === variables['boardId']);
      if (found !== undefined) {
        found.name = String(variables['name']);
      }
      return Promise.resolve(new Response(JSON.stringify({ data: { renameBoard: found } })));
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

async function open() {
  const view = mount(() => <Page />);
  await vi.waitFor(() => {
    expect(view.text()).toContain('Release 1.0');
  });
  return view;
}

it('lists the boards, with a count that reads as one language', async () => {
  const view = await open();
  // "0 cards", not "0 card": `Intl.PluralRules` picks the form and the JSON
  // file has both. The number is the badge beside it, said once.
  expect(view.text()).toContain(`0${t('boards.cards', { count: 0 })}`);
});

it('asks before it shows a form, and creates one when the form is filled', async () => {
  const view = await open();
  // Nothing is on screen until it is asked for: a permanent input in a header
  // is a permanent suggestion that something is missing.
  expect(view.all('input')).toHaveLength(0);

  view.get<HTMLButtonElement>('button').click();
  const input = view.get<HTMLInputElement>('input');
  input.value = 'Roadmap';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  view.get('form').dispatchEvent(new Event('submit', { bubbles: true }));

  // Nothing in this component mentions `boards`: the mutation's own
  // `@invalidates(name: "boards")` does, and the action's request is the
  // store's invalidation.
  await vi.waitFor(() => {
    expect(view.text()).toContain('Roadmap');
  });
  expect(sent.filter((operation) => operation === 'Boards')).toHaveLength(2);
});

it('renames a board in place', async () => {
  const view = await open();

  view.get<HTMLButtonElement>(`button[aria-label="${t('boards.rename')}"]`).click();
  const input = view.get<HTMLInputElement>('article input');
  input.value = 'Release 2.0';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  view.get('article form').dispatchEvent(new Event('submit', { bubbles: true }));

  await vi.waitFor(() => {
    expect(view.text()).toContain('Release 2.0');
  });
});
