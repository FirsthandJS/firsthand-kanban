/**
 * One board: four columns, drag and drop, and four mutations.
 *
 * This page is where the data layer earns its keep.
 *
 * **The resource depends on the id because it read it.** `props.id` is read
 * inside the loader, so walking from one board to another runs it again and
 * aborts the request that was in flight. Nothing was declared.
 *
 * **Every mutation says what it changed, in its own document.**
 * `@invalidates(name: "board", id: $boardId)` reloads *this* board and leaves
 * every other one alone; `@invalidates(name: "boards")` keeps the card counts
 * right on a list page that is not even mounted. No component here mentions
 * either: an action's request *is* the store's invalidation.
 *
 * **The reload reaches through the cache**, because an invalidated run is
 * forced — and nothing an action sends is put in the cache in the first place.
 *
 * **Dragging is the platform's.** `dragging` holds the card id while a drag is
 * happening, and `over` holds the column under the pointer. Two signals, four
 * handlers, no library — and the drop calls the same `moveCard` the arrow keys
 * do.
 */
import { component, computed, signal } from '@firsthandjs/dom';
import { useAction, useResource } from '@firsthandjs/data';
import { Link } from '@firsthandjs/router';
import BoardDocument from '../gql/board.gql';
import CreateCardDocument from '../gql/create-card.gql';
import DeleteCardDocument from '../gql/delete-card.gql';
import EditCardDocument from '../gql/edit-card.gql';
import MoveCardDocument from '../gql/move-card.gql';
import RenameBoardDocument from '../gql/rename-board.gql';
import { graphql } from '../setup/api';
import { t } from '../setup/i18n';
import { KIND_LABEL, type Kind } from '../setup/theme';
import { CardTile } from '../components/card';
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
  Rename,
  Skeleton,
  Slot,
  Summary,
  Title,
  Titles,
} from './board.styled';

export const Board = component<{ id: string }>((props) => {
  const board = useResource(({ request }) =>
    // `props.id` is read here, inside the loader: that is what makes it a
    // dependency, the same way it would be in an `effect`.
    graphql.query(BoardDocument, { id: props.id })(request),
  );

  const kind = signal<Kind>('FEATURE');
  const title = signal('');
  const composing = signal<string | null>(null);
  const renaming = signal(false);
  const name = signal('');
  /** The card being dragged, and the column the pointer is over. */
  const dragging = signal<string | null>(null);
  const over = signal<string | null>(null);

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

  const edit = useAction((input: { cardId: string; title: string }, { request }) =>
    graphql.mutate(EditCardDocument, { boardId: props.id, ...input })(request),
  );

  const rename = useAction((next: string, { request }) =>
    graphql.mutate(RenameBoardDocument, { boardId: props.id, name: next })(request),
  );

  const columns = computed(() => board.data.value?.board?.columns ?? []);

  /**
   * Focus, by hand.
   *
   * `autofocus` is honoured while a document loads, and every field here is
   * inserted long after that — so the attribute does nothing and `ref` is what
   * puts the cursor where somebody just asked for it.
   */
  const focusField = (field: HTMLInputElement): void => {
    field.focus();
    field.select();
  };
  const busy = computed(() => move.running.value || remove.running.value || edit.running.value);

  const addCard = async (event: Event, columnId: string): Promise<void> => {
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

  const saveName = async (event: Event): Promise<void> => {
    event.preventDefault();
    const next = name.peek().trim();
    renaming.value = false;
    if (next !== '' && next !== board.data.peek()?.board?.name) {
      await rename.run(next);
    }
  };

  const startRenaming = (): void => {
    name.value = board.data.peek()?.board?.name ?? '';
    renaming.value = true;
  };

  /** Moves a card one column along — what the arrow buttons do. */
  const shift = (cardId: string, index: number, direction: 1 | -1): void => {
    const all = columns.peek();
    const from = all.findIndex((column) => column.cards.some((card) => card.id === cardId));
    const to = all[from + direction];
    if (to === undefined) {
      return;
    }
    void move.run({ cardId, toColumnId: to.id, toIndex: Math.min(index, to.cards.length) });
  };

  /** Where in the column a drop landed: above the card it was dropped on. */
  const dropIndex = (event: DragEvent, columnId: string): number => {
    const cards = columns.peek().find((column) => column.id === columnId)?.cards ?? [];
    const target = (event.target as HTMLElement | null)?.closest('[data-card]');
    const id = target?.getAttribute('data-card');
    const at = cards.findIndex((card) => card.id === id);
    return at === -1 ? cards.length : at;
  };

  const drop = (event: DragEvent, columnId: string): void => {
    event.preventDefault();
    const cardId = dragging.peek();
    over.value = null;
    dragging.value = null;
    if (cardId === null) {
      return;
    }
    void move.run({ cardId, toColumnId: columnId, toIndex: dropIndex(event, columnId) });
  };

  /**
   * What the page is showing, as a cell rather than as four early returns.
   *
   * A component runs **once**: an `if` in the setup body is evaluated once and
   * never again, so a `return <Skeleton />` up here would be a skeleton for
   * ever. The branch belongs where it can be re-evaluated — in the view.
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
        <Skeleton aria-hidden="true">
          {[0, 1, 2, 3].map((column) => (
            <div key={column}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </Skeleton>
      ) : state.value === 'error' ? (
        <wa-callout variant="danger">{(board.error.value as Error).message}</wa-callout>
      ) : state.value === 'missing' ? (
        <Missing>
          <p>
            <strong>{t('board.missingTitle')}</strong> {t('board.missingBody')}
          </p>
          <Link to="/">← {t('board.back')}</Link>
        </Missing>
      ) : (
        <>
          <Head>
            <div>
              <Back>
                <Link to="/">← {t('board.back')}</Link>
              </Back>
              <Titles>
                {renaming.value ? (
                  <Rename onSubmit={(event: Event) => void saveName(event)}>
                    <input
                      value={name.value}
                      ref={focusField}
                      aria-label={t('boards.rename')}
                      onInput={(event: Event) =>
                        (name.value = (event.target as HTMLInputElement).value)
                      }
                      onBlur={(event: Event) => void saveName(event)}
                      onKeyDown={(event: KeyboardEvent) => {
                        if (event.key === 'Escape') {
                          renaming.value = false;
                        }
                      }}
                    />
                  </Rename>
                ) : (
                  <Title onDblClick={startRenaming}>{board.data.value?.board?.name}</Title>
                )}
                <button
                  type="button"
                  aria-label={t('boards.rename')}
                  onClick={startRenaming}
                  data-rename
                >
                  <wa-icon name="pencil" />
                </button>
              </Titles>
              <Summary>{board.data.value?.board?.summary}</Summary>
            </div>
            <Note $busy={board.loading.value}>
              {board.loading.value ? t('board.reloading') : t('board.upToDate')}
            </Note>
          </Head>

          <Frame>
            {columns.value.map((column, columnIndex) => (
              <Column
                key={column.id}
                $over={over.value === column.id}
                onDragOver={(event: DragEvent) => {
                  // Without this the browser refuses the drop.
                  event.preventDefault();
                  over.value = column.id;
                }}
                onDragLeave={() => {
                  if (over.peek() === column.id) {
                    over.value = null;
                  }
                }}
                onDrop={(event: DragEvent) => drop(event, column.id)}
              >
                <ColumnHead>
                  <Name>{column.name}</Name>
                  <Count>{column.cards.length}</Count>
                </ColumnHead>

                <Slot>
                  {column.cards.map((card, index) => (
                    <CardTile
                      key={card.id}
                      id={card.id}
                      title={card.title}
                      kind={card.kind as Kind}
                      first={columnIndex === 0}
                      last={columnIndex === columns.value.length - 1}
                      busy={busy.value}
                      dragging={dragging.value === card.id}
                      onBack={() => shift(card.id, index, -1)}
                      onForward={() => shift(card.id, index, 1)}
                      onDelete={() => void remove.run(card.id)}
                      onRename={(next) => void edit.run({ cardId: card.id, title: next })}
                      onDragStart={(event: DragEvent) => {
                        dragging.value = card.id;
                        event.dataTransfer?.setData('text/plain', card.id);
                      }}
                      onDragEnd={() => {
                        dragging.value = null;
                        over.value = null;
                      }}
                    />
                  ))}
                </Slot>

                {composing.value === column.id ? (
                  <Compose onSubmit={(event: Event) => void addCard(event, column.id)}>
                    <input
                      value={title.value}
                      ref={focusField}
                      placeholder={t('board.cardPlaceholder')}
                      aria-label={t('board.cardPlaceholder')}
                      onInput={(event: Event) =>
                        (title.value = (event.target as HTMLInputElement).value)
                      }
                      onKeyDown={(event: KeyboardEvent) => {
                        if (event.key === 'Escape') {
                          composing.value = null;
                        }
                      }}
                    />
                    <Kinds>
                      <span data-kinds>
                        {(Object.keys(KIND_LABEL) as Kind[]).map((one) => (
                          <button
                            key={one}
                            type="button"
                            data-kind={one}
                            data-active={String(kind.value === one)}
                            onClick={() => (kind.value = one)}
                          >
                            {t(`kind.${one}`)}
                          </button>
                        ))}
                      </span>
                      <span />
                      <button type="button" data-quiet onClick={() => (composing.value = null)}>
                        {t('board.cancel')}
                      </button>
                      <button type="submit" data-submit disabled={add.running.value}>
                        {t('board.addCardSubmit')}
                      </button>
                    </Kinds>
                  </Compose>
                ) : (
                  <button
                    type="button"
                    data-add
                    onClick={() => {
                      composing.value = column.id;
                      title.value = '';
                    }}
                  >
                    <wa-icon name="plus" /> {t('board.addCard')}
                  </button>
                )}
              </Column>
            ))}
          </Frame>
        </>
      )}
    </>
  );
});
