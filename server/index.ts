/**
 * The whole backend: GraphQL, mounted into Vite, holding everything in memory.
 *
 * It is deliberately the least interesting file in the repository. This
 * project exists to show a framework; a server worth studying would compete
 * with it for attention. So: no database, no migrations, no sessions table —
 * a few `Map`s, and a restart wipes them.
 *
 * Two things are real rather than mimed, because faking them would teach the
 * wrong lesson:
 *
 *   - Passwords are salted and hashed with scrypt. A demo that stores them in
 *     plain text is a demo somebody copies.
 *   - An unauthenticated request answers **401**, not a 200 with an error in
 *     the body. That is what lets the client treat a dead token as a dead
 *     session in one place.
 *
 * A deliberate 180 ms of latency makes loading and refetching visible, which
 * is most of what there is to look at in a cache.
 */
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GraphQLError } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import type { Plugin } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));

type Kind = 'FEATURE' | 'BUG' | 'CHORE';

interface Card {
  id: string;
  title: string;
  kind: Kind;
}
interface Column {
  id: string;
  name: string;
  cards: Card[];
}
interface Board {
  id: string;
  owner: string;
  name: string;
  summary: string;
  columns: Column[];
}
interface Account {
  id: string;
  name: string;
  email: string;
  salt: string;
  hash: string;
}

const accounts = new Map<string, Account>();
const sessions = new Map<string, string>();
const boards = new Map<string, Board>();

const LATENCY = 180;
const slowly = async <T>(value: T): Promise<T> => {
  await new Promise((wake) => setTimeout(wake, LATENCY));
  return value;
};

/**
 * A domain error, which is an ordinary GraphQL error: status 200, `errors` in
 * the body. "Use at least eight characters" is something the client has to
 * show a person, not a transport failure.
 *
 * The exception is authentication, and it is the only one: a rejected token
 * answers **401**, which is what lets the client end a session in one place
 * instead of one check per operation.
 */
const fail = (message: string, status?: number): never => {
  throw new GraphQLError(
    message,
    status === undefined ? undefined : { extensions: { http: { status } } },
  );
};

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

const hashed = (password: string, salt: string): string =>
  scryptSync(password, salt, 32).toString('hex');

const matches = (password: string, account: Account): boolean => {
  const attempt = Buffer.from(hashed(password, account.salt), 'hex');
  const stored = Buffer.from(account.hash, 'hex');
  return attempt.length === stored.length && timingSafeEqual(attempt, stored);
};

const issue = (account: Account): { token: string; account: Account } => {
  const token = randomBytes(24).toString('hex');
  sessions.set(token, account.id);
  return { token, account };
};

/** The account behind the bearer token, or a 401. */
const require_ = (context: { accountId: string | null }): string =>
  context.accountId ?? fail('Sign in to continue', 401);

// ---------------------------------------------------------------------------
// Boards
// ---------------------------------------------------------------------------

const COLUMNS = ['Backlog', 'In progress', 'Review', 'Shipped'];

const card = (title: string, kind: Kind): Card => ({ id: randomUUID(), title, kind });

/**
 * A new account gets a board with something in it.
 *
 * An empty first screen is a bad first screen, and the cards say what the
 * project is for — which is cheaper than a tour.
 */
function seed(owner: string): Board {
  const board: Board = {
    id: randomUUID(),
    owner,
    name: 'Firsthand, in practice',
    summary: 'Drag a card and watch what updates — and what does not.',
    columns: COLUMNS.map((name) => ({ id: randomUUID(), name, cards: [] })),
  };
  board.columns[0]?.cards.push(
    card('Read a signal where it is used', 'CHORE'),
    card('Give the effect a name so devtools can say it', 'CHORE'),
    card('Adjacent expressions share an anchor comment', 'BUG'),
  );
  board.columns[1]?.cards.push(
    card('Moving a card invalidates one tag', 'FEATURE'),
    card('The column counts follow, because they read the board', 'FEATURE'),
  );
  board.columns[2]?.cards.push(card('Keyed rows keep their DOM across a move', 'FEATURE'));
  board.columns[3]?.cards.push(
    card('Components run once', 'FEATURE'),
    card('No virtual DOM to diff', 'FEATURE'),
  );
  boards.set(board.id, board);
  return board;
}

const ownedBoard = (accountId: string, id: string): Board => {
  const board = boards.get(id);
  if (board === undefined || board.owner !== accountId) {
    return fail(`No board ${id}`);
  }
  return board;
};

const findCard = (board: Board, cardId: string): { column: Column; at: number } => {
  for (const column of board.columns) {
    const at = column.cards.findIndex((candidate) => candidate.id === cardId);
    if (at !== -1) {
      return { column, at };
    }
  }
  return fail(`No card ${cardId}`);
};

// ---------------------------------------------------------------------------

const schema = createSchema({
  typeDefs: readFileSync(resolve(here, 'schema.graphql'), 'utf8'),
  resolvers: {
    Board: {
      cardCount: (board: Board) => board.columns.reduce((sum, c) => sum + c.cards.length, 0),
    },
    Query: {
      me: (_p: unknown, _a: unknown, context: { accountId: string | null }) =>
        context.accountId === null
          ? null
          : [...accounts.values()].find((a) => a.id === context.accountId),
      boards: (_p: unknown, _a: unknown, context: { accountId: string | null }) => {
        const owner = require_(context);
        return slowly([...boards.values()].filter((board) => board.owner === owner));
      },
      board: (_p: unknown, args: { id: string }, context: { accountId: string | null }) => {
        // `null` rather than an error: the schema says this may be nothing,
        // and "that board is not here" is a page, not a failure.
        const owner = require_(context);
        const board = boards.get(args.id);
        return slowly(board === undefined || board.owner !== owner ? null : board);
      },
    },
    Mutation: {
      register: (_p: unknown, args: { name: string; email: string; password: string }) => {
        const email = args.email.trim().toLowerCase();
        if (accounts.has(email)) {
          return fail('That address is already registered');
        }
        if (args.password.length < 8) {
          return fail('Use at least eight characters');
        }
        const salt = randomBytes(16).toString('hex');
        const account: Account = {
          id: randomUUID(),
          name: args.name.trim(),
          email,
          salt,
          hash: hashed(args.password, salt),
        };
        accounts.set(email, account);
        seed(account.id);
        return slowly(issue(account));
      },
      logIn: (_p: unknown, args: { email: string; password: string }) => {
        const account = accounts.get(args.email.trim().toLowerCase());
        if (account === undefined || !matches(args.password, account)) {
          // One message for both cases, so the endpoint does not say which
          // addresses exist.
          return fail('That email and password do not match', 401);
        }
        return slowly(issue(account));
      },
      createBoard: (_p: unknown, args: { name: string }, context: { accountId: string | null }) => {
        const owner = require_(context);
        const board: Board = {
          id: randomUUID(),
          owner,
          name: args.name.trim(),
          summary: 'Empty, and waiting.',
          columns: COLUMNS.map((name) => ({ id: randomUUID(), name, cards: [] })),
        };
        boards.set(board.id, board);
        return slowly(board);
      },
      createCard: (
        _p: unknown,
        args: { boardId: string; columnId: string; title: string; kind: Kind },
        context: { accountId: string | null },
      ) => {
        const board = ownedBoard(require_(context), args.boardId);
        const column = board.columns.find((candidate) => candidate.id === args.columnId);
        if (column === undefined) {
          return fail(`No column ${args.columnId}`);
        }
        const created = card(args.title.trim(), args.kind);
        column.cards.push(created);
        return slowly(created);
      },
      moveCard: (
        _p: unknown,
        args: { boardId: string; cardId: string; toColumnId: string; toIndex: number },
        context: { accountId: string | null },
      ) => {
        const board = ownedBoard(require_(context), args.boardId);
        const { column, at } = findCard(board, args.cardId);
        const target = board.columns.find((candidate) => candidate.id === args.toColumnId);
        if (target === undefined) {
          return fail(`No column ${args.toColumnId}`);
        }
        const [moved] = column.cards.splice(at, 1);
        target.cards.splice(Math.max(0, Math.min(args.toIndex, target.cards.length)), 0, moved!);
        return slowly(board);
      },
      deleteCard: (
        _p: unknown,
        args: { boardId: string; cardId: string },
        context: { accountId: string | null },
      ) => {
        const board = ownedBoard(require_(context), args.boardId);
        const { column, at } = findCard(board, args.cardId);
        column.cards.splice(at, 1);
        return slowly(args.cardId);
      },
    },
  },
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  logging: false,
  context: ({ request }) => {
    const header = request.headers.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    return { accountId: sessions.get(token) ?? null };
  },
});

/** Serves `/graphql` from the dev server and from `vite preview` alike. */
export function graphqlServer(): Plugin {
  return {
    name: 'kanban-graphql',
    // Braces, not a concise body: the hook is typed as returning nothing, and
    // `use()` returns the server.
    configureServer: (server) => {
      server.middlewares.use('/graphql', yoga);
    },
    configurePreviewServer: (server) => {
      server.middlewares.use('/graphql', yoga);
    },
  };
}
