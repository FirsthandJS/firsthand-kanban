# How this project is laid out

Three rules, and everything below follows from them.

1. **A component renders. It does not decide.** What to load, what a mutation
   changes, what counts as a valid name, when a draft is worth saving — none of
   that belongs in a file whose job is to produce markup.
2. **Things that change together live together.** A feature is a folder:
   its operations, its state, its pages and the components only it uses. Not
   `components/` for the whole application, `pages/` for the whole application,
   and a hunt through both to change one thing.
3. **A component has one responsibility, and it is usually one noun.** A board
   is not a lane is not a card. When a file renders all three, moving a card
   means reading four hundred lines to find the eighty that matter.

## The shape

```
src/
  app/                    the application as a whole
    main.tsx              the three things that are application-wide
    routes.tsx            what is at which path, and what is guarded
    shell/                the frame: header, account, language, page transition

  features/
    session/              who is signed in
      model.ts            token and account, as signals; sign in, sign out
      api.ts              logIn, register — the operations, as hooks
      gql/                the documents only this feature sends
      locales/            the words only this feature says
      pages/sign-in.tsx   the page

    boards/               the list of boards
      api.ts              useBoards, useBoardActions
      gql/ locales/
      pages/boards.tsx    lays out the page; renders tiles
      components/         tile, form

    board/                one board
      api.ts              useBoard, useBoardActions
      model.ts            the drag: what is held, what it is over
      gql/ locales/
      pages/board.tsx     lays out the lanes
      components/         lane, card, composer, title, status

  shared/                 what more than one feature needs
    api/                  the urql client, the cache, the 401 seam
    i18n/                 the translator and the plurals; the words are in the features
    ui/                   the theme, the motion token, common styled pieces
```

**Everything a feature needs is inside it**, including its GraphQL documents
and its words. `codegen.ts` points at `src/features/**/gql/*.gql` and the
translator imports each feature's `locales/en.json`, so adding a feature adds a
folder and deleting one deletes everything it owned — no central file to prune
afterwards and no orphaned key nobody dares remove.

## Where the logic goes

Each feature has an **`api.ts`** that exports hooks, and those hooks are the
only place `useResource` and `useAction` appear:

```ts
// features/board/api.ts
export function useBoard(id: () => string) {
  return useResource(({ request }) => graphql.query(BoardDocument, { id: id() })(request));
}

export function useCardActions(boardId: () => string) {
  const add = useAction((input: NewCard, { request }) =>
    graphql.mutate(CreateCardDocument, { boardId: boardId(), ...input })(request),
  );
  …
  return { add, move, edit, remove, busy };
}
```

A page then reads:

```tsx
const board = useBoard(() => props.id);
const cards = useCardActions(() => props.id);
```

Three things follow from that, and they are the point:

- **The page has no idea there is a GraphQL server.** Swapping urql for Apollo,
  or for a REST client, touches `features/*/api.ts` and `shared/api/` and
  nothing else.
- **The rules are testable without a DOM.** "An empty title is not saved",
  "a move clamps to the end of the column" are functions now, not click
  handlers.
- **A component's imports say what it does.** A file that imports a `.gql`
  document is doing transport; a file that imports its feature's hooks is doing
  layout.

The one thing that deliberately stays in the component is **local interaction
state**: whether this card is being edited, which column has the composer open.
It is not business logic, nobody else can use it, and lifting it would turn one
signal into a prop, a callback and a comment explaining the pair.

## Why hooks rather than a store

A store — one object holding boards, cards and the operations on them — is the
other obvious answer, and it is the wrong one here. Firsthand's resources are
already the state: they hold `data`, `status`, `loading` and `error`, they
reload when their tags are invalidated, and they die with the component that
asked. Putting a second model in front of that means keeping two copies of the
same truth in step, which is the problem
[ADR-0022](https://github.com/firsthandjs/firsthand/blob/main/docs/adr/0022-resources-not-a-cache.md)
exists to avoid.

What a feature's `api.ts` is, then, is not a store but a **vocabulary**: the
operations this feature has, named once, so that a page can ask for them
without knowing how they are carried out.
