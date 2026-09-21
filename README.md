# Firsthand kanban

A kanban board built with [Firsthand](https://github.com/FirsthandJS/firsthand)
and [Web Awesome](https://webawesome.com), against a GraphQL server that keeps
everything in memory.

It exists to show the framework doing a whole job: sign in, pick a board, move
cards, and watch what the data layer does about it.

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
request *is* the store's invalidation, so moving a card reloads this board —
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
wraps the request, which is where a 401 ends the session. There is no plugin
system, because at this size there does not have to be one.

## The shape of it

```
server/
  schema.graphql            the whole API, deliberately small
  index.ts                  graphql-yoga in the Vite process, state in Maps
src/
  main.tsx                  theme, data store, routes
  setup/
    api.ts                  fetch client + cache + GraphQL, and the 401 seam
    session.ts              who is signed in, as two signals
    theme.ts                what the application decides; colour is Web Awesome's
    webawesome.ts           the six components used, and a local icon library
    devtools.ts             development only, dynamically imported
  gql/                      one operation per file, tags as directives
  shell/                    the frame: header, account, sign out
  pages/
    sign-in.tsx             register and log in, one form
    boards.tsx              the list, and the form that adds to it
    board.tsx               columns, cards, and the three mutations
  components/
    card.tsx                one card and its three buttons
```

Every file that renders has a `.styled.tsx` beside it, and every test sits
beside what it tests.

## The server

`graphql-yoga`, mounted into Vite, holding everything in memory. It is the
least interesting file here on purpose — but two things are real rather than
mimed, because faking them would teach the wrong lesson:

- **Passwords are salted and hashed** with scrypt. A demo that stores them in
  plain text is a demo somebody copies.
- **An unauthenticated request answers 401**, not a 200 with an error in the
  body. That is what lets the client treat a dead token as a dead session in
  one place rather than one per operation. It is the *only* non-200: everything
  else a person can get wrong — a short password, an address already
  registered, the wrong password — is an ordinary GraphQL error, because those
  are messages to show rather than transport failures.

There is a deliberate 180 ms of latency, so that loading, reloading and the
cache are visible rather than theoretical.

## GraphQL without a GraphQL client

There is no urql or Apollo here. The `.gql` files become parsed documents at
build time — fragments inlined, tags read from the directives, the directives
stripped before anything is sent, and the parser never shipped — and
`setup/api.ts` posts them with the fetch client.

That is a choice, not a limitation: an application that wants normalised
caching, subscriptions or exchanges installs
[`@firsthandjs/data-urql`](https://www.npmjs.com/package/@firsthandjs/data-urql)
or [`-apollo`](https://www.npmjs.com/package/@firsthandjs/data-apollo) and
changes one file. `createUrqlClient(client).query(Document, variables)` has the
same shape as `graphql.query(...)` here, deliberately.

Types come from the schema: `npm run codegen` writes one `declare module` per
operation, so no call site carries a type argument and an operation with
required variables cannot be called without them.

## Scripts

| Command           | What it does                                     |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Vite, the compiler plugin and the server         |
| `npm run build`   | A production build into `dist/`                  |
| `npm run preview` | Serves that build, server included               |
| `npm run codegen` | Types for every `.gql` file, from the schema     |
| `npm run check`   | Codegen, then `tsc --noEmit`                     |
| `npm test`        | Vitest                                           |

Press **Ctrl+Shift+F** for the devtools panel: pick a card and it names the
signal behind it, and the queries tab says which tag caused which reload.

## Documentation

The [data guide](https://github.com/FirsthandJS/firsthand/blob/main/docs/guide/09-data.md)
covers resources, actions, tags and the cache;
[web components](https://github.com/FirsthandJS/firsthand/blob/main/docs/guide/10-web-components.md)
covers what makes Web Awesome work here without a wrapper.

MIT licensed.
