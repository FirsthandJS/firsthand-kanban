/**
 * The board list, and the form that adds to it.
 *
 * The two halves of the data layer are both here, and they do not know about
 * each other:
 *
 * **A resource** loads the boards and holds the state — `status` for "nothing
 * to show yet", `loading` for "asking again", and `data` that stays on screen
 * while it asks.
 *
 * **An action** creates one. Its document carries `@invalidates(name: "boards")`,
 * and the request an action is given *is* the store's invalidation — so the
 * list reloads without this form mentioning it, and the reload is forced,
 * which is what gets it past the ten-second cache in `setup/api.ts`.
 */
import { component, signal } from '@firsthandjs/dom';
import { useAction, useResource } from '@firsthandjs/data';
import { Link } from '@firsthandjs/router';
import BoardsDocument from '../gql/boards.gql';
import CreateBoardDocument from '../gql/create-board.gql';
import { graphql } from '../setup/api';
import {
  Blank,
  Cards,
  Count,
  Create,
  Grid,
  Head,
  Name,
  Summary,
  Tile,
  Title,
} from './boards.styled';

export const Boards = component(() => {
  const boards = useResource(({ request }) => graphql.query(BoardsDocument)(request));
  const name = signal('');

  const create = useAction((title: string, { request }) =>
    graphql.mutate(CreateBoardDocument, { name: title })(request),
  );

  const submit = async (event: Event): Promise<void> => {
    event.preventDefault();
    const title = name.peek().trim();
    if (title === '') {
      return;
    }
    const made = await create.run(title);
    if (made !== undefined) {
      name.value = '';
    }
  };

  return (
    <>
      <Head>
        <Title>Your boards</Title>
        <Create onSubmit={(event: Event) => void submit(event)}>
          <wa-input
            size="small"
            placeholder="New board"
            value={name.value}
            onInput={(event: Event) => (name.value = (event.target as HTMLInputElement).value)}
          />
          <wa-button
            type="submit"
            size="small"
            variant="brand"
            loading={create.running.value || undefined}
          >
            <wa-icon slot="start" name="plus" />
            Add
          </wa-button>
        </Create>
      </Head>

      {boards.status.value === 'loading' ? (
        <wa-spinner />
      ) : boards.status.value === 'error' ? (
        <wa-callout variant="danger">{(boards.error.value as Error).message}</wa-callout>
      ) : (
        // `loading` is true even while the previous list is still on screen,
        // which is why a reload dims rather than blanks it.
        <Grid $stale={boards.loading.value}>
          {(boards.data.value?.boards ?? []).map((board) => (
            <Link key={board.id} to={`/boards/${board.id}`}>
              <Tile>
                <Name>{board.name}</Name>
                <Summary>{board.summary}</Summary>
                <Count>
                  <wa-badge variant="neutral">{board.cardCount}</wa-badge>
                  <span>{board.cardCount === 1 ? 'card' : 'cards'}</span>
                </Count>
              </Tile>
            </Link>
          ))}
          {(boards.data.value?.boards ?? []).length === 0 ? (
            <Blank>
              <Cards>Nothing here yet.</Cards>
              <span>Name a board above and it will appear — the list invalidates itself.</span>
            </Blank>
          ) : null}
        </Grid>
      )}
    </>
  );
});
