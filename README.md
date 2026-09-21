# Firsthand kanban

A kanban board built with [Firsthand](https://github.com/FirsthandJS/firsthand)
and [Web Awesome](https://webawesome.com), against a GraphQL server that keeps
everything in memory.

It exists to show the framework doing a whole job: sign in, pick a board, drag
cards between columns, rename what needs renaming, switch language — and watch
what the data layer does about all of it.

## Running it

```bash
npm install
npm run dev
```

That is everything. **There is no second server to start**: the GraphQL API
runs inside the Vite process as a plugin, so `npm run dev` serves the
application and the API together, and `npm run preview` does the same for a
production build.

Then open the URL it prints and **register** — any name and email address you
like, and a password of **at least eight characters**. Nothing is sent
anywhere: accounts, boards and cards live in a few `Map`s in that process, and
stopping it forgets all of them.

## What there is to look at

**Two layers, and the seam between them.** `useResource` and `useAction` hold
state — loading, loaded, failed, and when to run again. `setup/api.ts` holds
the transport: one `createFetchClient`, one `createCacheClient`, and twenty
lines of GraphQL on top. Between them travels one object, `{ signal, force }`,
and that is the entire contract.

**Mutations say what they changed, in their own documents.** `move-card.gql`
carries `@invalidates(name: "board", id: $boardId)` and
`@invalidates(name: "boards")`. No component mentions either: an action's
request _is_ the store's invalidation, so moving a card reloads this board —
and only this board — and keeps the card counts right on a list page that is
not even mounted.

**The invalidation reaches through the cache.** The client keeps answers for
ten seconds, so walking from the list into a board and back is free. An
invalidated run is `force`d, which drops the entry instead of being answered
out of it. The line under the board title says which of the two is happening.

**A component runs once.** Watch the board while a card moves: the columns are
not re-rendered, the DOM nodes are not replaced, and the one card that moved is
the one thing that moves.

**Authentication is two functions.** `headers` is read per request — so a token
that changes is the current one, and no resource depends on it — and `fetch`
wraps the request, which is where a 401 ends the session. urql has exchanges
for more than that; this needs neither.

**Every word comes from a JSON file.** One per feature, per language:
`locales/en/board.json`, `locales/de/board.json`. English is bundled, German is
an `import()` that runs when somebody asks for it — and when it lands, only the
expressions that read `t` run again. Switch the language mid-drag and the card
stays where your pointer is.

## The shape of it

```
server/
  schema.graphql            the whole API, deliberately small
  index.ts                  graphql-yoga in the Vite process, state in Maps
src/
  app/                      the application as a whole
    main.tsx                theme, data store, router
    routes.tsx              what is at which path, and what is guarded
    shell/                  the frame, and its own locales
  features/
    session/                who is signed in
      api.ts                logIn and register, and what opening a session means
      model.ts              token and account, as signals
      pages/ locales/
    boards/                 the list
      api.ts                useBoards, useBoardActions — every rule about a name
      components/           tile, form
      pages/ locales/
    board/                  one board
      api.ts                useBoard, useBoardActions — add, move, edit, remove
      model.ts              the drag: what is held, what it is over
      components/           lane, card, composer, title
      pages/ locales/
  shared/
    api/                    the urql client, the cache, the 401 seam
    i18n/                   the translator, plurals, the late-loaded language
    ui/                     the theme and the motion token
  gql/                      one operation per file, tags as directives
```

Three rules, written out in [ARCHITECTURE.md](ARCHITECTURE.md): a component
renders and does not decide, things that change together live together, and a
board is not a lane is not a card. Every file that renders has a `.styled.tsx`
beside it, every test sits beside what it tests, and imports are absolute —
`@/features/board/api`, never `../../../`.

## The server

`graphql-yoga`, mounted into Vite, holding everything in memory. It is the
least interesting file here on purpose — but two things are real rather than
mimed, because faking them would teach the wrong lesson:

- **Passwords are salted and hashed** with scrypt. A demo that stores them in
  plain text is a demo somebody copies.
- **An unauthenticated request answers 401**, not a 200 with an error in the
  body. That is what lets the client treat a dead token as a dead session in
  one place rather than one per operation. It is the _only_ non-200: everything
  else a person can get wrong — a short password, an address already
  registered, the wrong password — is an ordinary GraphQL error, because those
  are messages to show rather than transport failures.

There is a deliberate 180 ms of latency, so that loading, reloading and the
cache are visible rather than theoretical.

## GraphQL: urql, bound in one file

The client is urql, built in `setup/api.ts` with its URL, its exchanges and its
`fetch` wrapper. `createUrqlClient` from
[`@firsthandjs/data-urql`](https://www.npmjs.com/package/@firsthandjs/data-urql)
binds two of its methods and adds what the resource layer needs: the abort
signal, the cache, and the document's own directives reported into the request.

Nothing here parses GraphQL, posts JSON or unwraps an answer — which is how a
project ends up maintaining a client it never meant to write.

The `.gql` files become parsed documents at build time: fragments inlined, tags
read from the `@tag` / `@invalidates` directives, the directives stripped before
anything is sent, and the parser never shipped. `npm run codegen` writes one
`declare module` per operation from the schema, so no call site carries a type
argument and an operation with required variables cannot be called without
them.

The one decision worth noticing: urql runs with `fetchExchange` and **no**
`cacheExchange`. A normalising cache and a store of resources are two answers
to "what is the current state", and two answers disagree — so urql is the
transport, the resources are the state, and `createCacheClient` holds answers
for ten seconds at the transport edge where an invalidation can reach through
them.

## Scripts

| Command           | What it does                                 |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Vite, the compiler plugin and the server     |
| `npm run build`   | A production build into `dist/`              |
| `npm run preview` | Serves that build, server included           |
| `npm run codegen` | Types for every `.gql` file, from the schema |
| `npm run check`   | Codegen, then `tsc --noEmit`                 |
| `npm test`        | Vitest                                       |

Press **Ctrl+Shift+F** for the devtools panel: pick a card and it names the
signal behind it, and the queries tab says which tag caused which reload.

## Documentation

The [data guide](https://github.com/FirsthandJS/firsthand/blob/main/docs/guide/09-data.md)
covers resources, actions, tags and the cache;
[web components](https://github.com/FirsthandJS/firsthand/blob/main/docs/guide/10-web-components.md)
covers what makes Web Awesome work here without a wrapper.

MIT licensed.
