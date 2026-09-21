/**
 * The board list: what you have, and the two ways to change it.
 *
 * Both halves of the data layer are here and they do not know about each
 * other. **A resource** loads the boards and holds the state — `status` for
 * "nothing to show yet", `loading` for "asking again", `data` that stays on
 * screen while it asks. **Actions** create and rename, and their documents
 * carry `@invalidates(name: "boards")`, which is the only thing connecting
 * them to the list above.
 *
 * The form is not there until it is asked for: a permanent input in a header
 * is a permanent suggestion that something is missing.
 */
import { component, signal } from '@firsthandjs/dom';
import { useAction, useResource } from '@firsthandjs/data';
import { useNavigate } from '@firsthandjs/router';
import BoardsDocument from '../gql/boards.gql';
import CreateBoardDocument from '../gql/create-board.gql';
import DeleteBoardDocument from '../gql/delete-board.gql';
import RenameBoardDocument from '../gql/rename-board.gql';
import { fresh, graphql } from '../setup/api';
import { t } from '../setup/i18n';
import {
  Blank,
  Confirm,
  Count,
  Create,
  Grid,
  Head,
  Name,
  New,
  Rename,
  Skeleton,
  Summary,
  Tile,
  Title,
} from './boards.styled';

export const Boards = component(() => {
  const navigate = useNavigate();
  // Uncached: nobody is watching this list while you are inside a board, so
  // an invalidation from there reaches nothing — see `setup/api.ts`.
  const boards = useResource(({ request }) => fresh().query(BoardsDocument)(request));

  const adding = signal(false);
  const name = signal('');
  /** The board whose name is being edited, if any. */
  const renaming = signal<string | null>(null);
  const draft = signal('');

  const create = useAction((title: string, { request }) =>
    graphql.mutate(CreateBoardDocument, { name: title })(request),
  );

  const rename = useAction((input: { boardId: string; name: string }, { request }) =>
    graphql.mutate(RenameBoardDocument, input)(request),
  );

  const remove = useAction((boardId: string, { request }) =>
    graphql.mutate(DeleteBoardDocument, { boardId })(request),
  );

  /** The board asked about, if any. A second click is the confirmation. */
  const confirming = signal<string | null>(null);

  /**
   * Focus, by hand.
   *
   * `autofocus` is honoured while a document loads, and these fields are
   * inserted long after that — so the attribute does nothing, and `ref` is
   * what puts the cursor where somebody just asked for it.
   */
  const focusField = (field: HTMLInputElement): void => {
    field.focus();
    field.select();
  };

  const submit = async (event: Event): Promise<void> => {
    event.preventDefault();
    const title = name.peek().trim();
    if (title === '') {
      adding.value = false;
      return;
    }
    const made = await create.run(title);
    if (made !== undefined) {
      name.value = '';
      adding.value = false;
    }
  };

  const startRenaming = (event: Event, id: string, current: string): void => {
    event.preventDefault();
    event.stopPropagation();
    draft.value = current;
    renaming.value = id;
  };

  const saveName = async (event: Event, id: string, current: string): Promise<void> => {
    event.preventDefault();
    const next = draft.peek().trim();
    renaming.value = null;
    if (next !== '' && next !== current) {
      await rename.run({ boardId: id, name: next });
    }
  };

  return (
    <>
      <Head>
        <Title>{t('boards.title')}</Title>
        {adding.value ? (
          <Create onSubmit={(event: Event) => void submit(event)}>
            <input
              value={name.value}
              ref={focusField}
              placeholder={t('boards.newPlaceholder')}
              aria-label={t('boards.new')}
              onInput={(event: Event) => (name.value = (event.target as HTMLInputElement).value)}
              onKeyDown={(event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                  adding.value = false;
                }
              }}
            />
            <button type="button" data-quiet onClick={() => (adding.value = false)}>
              {t('boards.cancel')}
            </button>
            <button type="submit" data-submit disabled={create.running.value}>
              {t('boards.add')}
            </button>
          </Create>
        ) : (
          <New
            type="button"
            onClick={() => {
              name.value = '';
              adding.value = true;
            }}
          >
            <wa-icon name="plus" />
            {t('boards.new')}
          </New>
        )}
      </Head>

      {boards.status.value === 'loading' ? (
        <Skeleton aria-hidden="true">
          {[0, 1, 2].map((tile) => (
            <div key={tile} />
          ))}
        </Skeleton>
      ) : boards.status.value === 'error' ? (
        <wa-callout variant="danger">{(boards.error.value as Error).message}</wa-callout>
      ) : (
        // `loading` is true even while the previous list is still on screen,
        // which is why a reload dims rather than blanks it.
        <Grid $stale={boards.loading.value}>
          {(boards.data.value?.boards ?? []).map((board) => (
            <Tile
              key={board.id}
              data-board={board.id}
              tabindex={0}
              role="link"
              aria-label={`${t('boards.open')}: ${board.name}`}
              onClick={(event: MouseEvent) => {
                // A click on the pencil, the input or a button inside is not a
                // click on the tile.
                if ((event.target as HTMLElement).closest('button, input, form') === null) {
                  navigate(`/boards/${board.id}`);
                }
              }}
              onKeyDown={(event: KeyboardEvent) => {
                // Only when the tile itself has focus. Enter inside the rename
                // field submits that field, and it bubbles to here — which
                // opened the board behind the rename that had just been typed.
                if (event.target !== event.currentTarget) {
                  return;
                }
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate(`/boards/${board.id}`);
                }
              }}
            >
              {renaming.value === board.id ? (
                <Rename
                  onClick={(event: Event) => event.stopPropagation()}
                  onSubmit={(event: Event) => void saveName(event, board.id, board.name)}
                >
                  <input
                    value={draft.value}
                    ref={focusField}
                    aria-label={t('boards.rename')}
                    onInput={(event: Event) =>
                      (draft.value = (event.target as HTMLInputElement).value)
                    }
                    onBlur={(event: Event) => void saveName(event, board.id, board.name)}
                    onKeyDown={(event: KeyboardEvent) => {
                      if (event.key === 'Escape') {
                        renaming.value = null;
                      }
                    }}
                  />
                </Rename>
              ) : (
                <Name>
                  {board.name}
                  <button
                    type="button"
                    aria-label={t('boards.rename')}
                    onClick={(event: Event) => startRenaming(event, board.id, board.name)}
                  >
                    <wa-icon name="pencil" />
                  </button>
                  <button
                    type="button"
                    data-delete
                    aria-label={t('boards.delete')}
                    onClick={(event: Event) => {
                      event.stopPropagation();
                      confirming.value = board.id;
                    }}
                  >
                    <wa-icon name="trash" />
                  </button>
                </Name>
              )}
              {confirming.value === board.id ? (
                // A question rather than a dialog: it is one board, the answer
                // is one click, and a modal for that is theatre.
                <Confirm onClick={(event: Event) => event.stopPropagation()}>
                  <span>{t('boards.confirm')}</span>
                  <button type="button" data-quiet onClick={() => (confirming.value = null)}>
                    {t('boards.confirmNo')}
                  </button>
                  <button
                    type="button"
                    data-danger
                    disabled={remove.running.value}
                    onClick={() => {
                      confirming.value = null;
                      void remove.run(board.id);
                    }}
                  >
                    {t('boards.confirmYes')}
                  </button>
                </Confirm>
              ) : (
                <Summary>{board.summary}</Summary>
              )}
              <Count>
                <span>{board.cardCount}</span>
                {t('boards.cards', { count: board.cardCount })}
              </Count>
            </Tile>
          ))}

          {(boards.data.value?.boards ?? []).length === 0 ? (
            <Blank>
              <strong>{t('boards.emptyTitle')}</strong>
              <span>{t('boards.emptyBody')}</span>
            </Blank>
          ) : null}
        </Grid>
      )}
    </>
  );
});
