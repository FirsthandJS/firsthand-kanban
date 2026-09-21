/**
 * One board: columns, cards, and the three things you can do to them.
 *
 * This page is where the data layer earns its keep.
 *
 * **The resource depends on the id because it read it.** `props.id` is read
 * inside the loader, so walking from one board to another runs it again and
 * aborts the request that was in flight. Nothing was declared.
 *
 * **Every mutation says what it changed, in its own document.** `@invalidates(name: "board", id: $boardId)`
 * reloads *this* board and leaves every other one alone, and
 * `@invalidates(name: "boards")` keeps the card counts on the list page right
 * — a page that is not even mounted. No component here mentions either.
 *
 * **The reload reaches through the cache**, because an invalidated run is
 * forced, and `force` is in the request every client is handed.
 *
 * Moving a card is a button rather than a drag, deliberately: dragging is a
 * pointer-events exercise, and what there is to see here is the round trip.
 */
import { component, computed, signal } from '@firsthandjs/dom';
import { useAction, useResource } from '@firsthandjs/data';
import { Link } from '@firsthandjs/router';
import BoardDocument from '../gql/board.gql';
import CreateCardDocument from '../gql/create-card.gql';
import DeleteCardDocument from '../gql/delete-card.gql';
import MoveCardDocument from '../gql/move-card.gql';
import { graphql } from '../setup/api';
import { KIND_LABEL, type Kind } from '../setup/theme';
import {
  Back,
  Board as Frame,
  Column,
  ColumnHead,
  Compose,
  Count,
  Head,
  Kinds,
  Missing,
  Name,
  Note,
  Slot,
  Summary,
  Title,
} from './board.styled';
import { CardTile } from '../components/card';

export const Board = component<{ id: string }>((props) => {
  const board = useResource(({ request }) =>
    // `props.id` is read here, inside the loader: that is what makes it a
    // dependency, the same way it would be in an `effect`.
    graphql.query(BoardDocument, { id: props.id })(request),
  );

  const kind = signal<Kind>('FEATURE');
  const title = signal('');
  const composing = signal<string | null>(null);

  const add = useAction((columnId: string, { request }) =>
    graphql.mutate(CreateCardDocument, {
      boardId: props.id,
      columnId,
      title: title.peek().trim(),
      kind: kind.peek(),
    })(request),
  );

  const move = useAction(
    (input: { cardId: string; toColumnId: string; toIndex: number }, { request }) =>
      graphql.mutate(MoveCardDocument, { boardId: props.id, ...input })(request),
  );

  const remove = useAction((cardId: string, { request }) =>
    graphql.mutate(DeleteCardDocument, { boardId: props.id, cardId })(request),
  );

  const columns = computed(() => board.data.value?.board?.columns ?? []);

  const submit = async (event: Event, columnId: string): Promise<void> => {
    event.preventDefault();
    if (title.peek().trim() === '') {
      return;
    }
    const made = await add.run(columnId);
    if (made !== undefined) {
      title.value = '';
      composing.value = null;
    }
  };

  const shift = (cardId: string, index: number, direction: 1 | -1): void => {
    const all = columns.peek();
    const from = all.findIndex((column) => column.cards.some((card) => card.id === cardId));
    const to = all[from + direction];
    if (to === undefined) {
      return;
    }
    void move.run({ cardId, toColumnId: to.id, toIndex: Math.min(index, to.cards.length) });
  };

  /**
   * The state of the page, as a cell rather than as four early returns.
   *
   * A component runs **once**: an `if` in the setup body is evaluated once and
   * never again, so a `return <wa-spinner />` up here would be a spinner
   * for ever. The branch belongs where it can be re-evaluated — in the view.
   */
  const state = computed(() => {
    if (board.status.value === 'loading') {
      return 'loading' as const;
    }
    if (board.status.value === 'error') {
      return 'error' as const;
    }
    return board.data.value?.board == null ? ('missing' as const) : ('ready' as const);
  });

  return (
    <>
      {state.value === 'loading' ? (
        <wa-spinner />
      ) : state.value === 'error' ? (
        <wa-callout variant="danger">{(board.error.value as Error).message}</wa-callout>
      ) : state.value === 'missing' ? (
        <Missing>
          <p>That board is not here. It may belong to another account.</p>
          <Link to="/">Back to your boards</Link>
        </Missing>
      ) : (
        <>
          <Head>
            <div>
              <Back>
                <Link to="/">← All boards</Link>
              </Back>
              <Title>{board.data.value?.board?.name}</Title>
              <Summary>{board.data.value?.board?.summary}</Summary>
            </div>
            <Note $busy={board.loading.value}>
              {board.loading.value
                ? 'Reloading — the invalidation reached through the cache'
                : 'Up to date'}
            </Note>
          </Head>

          <Frame>
            {columns.value.map((column, columnIndex) => (
              <Column key={column.id}>
                <ColumnHead>
                  <Name>{column.name}</Name>
                  <Count>{column.cards.length}</Count>
                </ColumnHead>

                <Slot>
                  {column.cards.map((card, index) => (
                    <CardTile
                      key={card.id}
                      title={card.title}
                      kind={card.kind as Kind}
                      first={columnIndex === 0}
                      last={columnIndex === columns.value.length - 1}
                      busy={move.running.value || remove.running.value}
                      onBack={() => shift(card.id, index, -1)}
                      onForward={() => shift(card.id, index, 1)}
                      onDelete={() => void remove.run(card.id)}
                    />
                  ))}
                </Slot>

                {composing.value === column.id ? (
                  <Compose onSubmit={(event: Event) => void submit(event, column.id)}>
                    <wa-input
                      size="small"
                      placeholder="What needs doing?"
                      value={title.value}
                      autofocus
                      onInput={(event: Event) =>
                        (title.value = (event.target as HTMLInputElement).value)
                      }
                    />
                    <Kinds>
                      {(Object.keys(KIND_LABEL) as Kind[]).map((one) => (
                        <button
                          key={one}
                          type="button"
                          data-active={String(kind.value === one)}
                          onClick={() => (kind.value = one)}
                        >
                          {KIND_LABEL[one]}
                        </button>
                      ))}
                    </Kinds>
                    <wa-button
                      type="submit"
                      size="small"
                      variant="brand"
                      loading={add.running.value || undefined}
                    >
                      Add card
                    </wa-button>
                  </Compose>
                ) : (
                  <wa-button
                    size="small"
                    appearance="plain"
                    onClick={() => {
                      composing.value = column.id;
                      title.value = '';
                    }}
                  >
                    <wa-icon slot="start" name="plus" />
                    Add a card
                  </wa-button>
                )}
              </Column>
            ))}
          </Frame>
        </>
      )}
    </>
  );
});
