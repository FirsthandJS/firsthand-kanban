/**
 * The board list: the boards, and the form that adds one.
 *
 * Both halves of the data layer are here and they do not know about each
 * other. A resource loads the list and holds the state; actions change it, and
 * their documents carry `@invalidates(name: "boards")` — which is the only
 * thing connecting them.
 */
import { component } from '@firsthandjs/dom';
import { useNavigate } from '@firsthandjs/router';
import { useBoardActions, useBoards } from '@/features/boards/api';
import { BoardForm } from '@/features/boards/components/form';
import { BoardTile } from '@/features/boards/components/tile';
import { t } from '@/shared/i18n';
import { Blank, Grid, Head, Skeleton, Title } from './boards.styled';

export const Boards = component(() => {
  const navigate = useNavigate();
  const boards = useBoards();
  const actions = useBoardActions();

  return (
    <>
      <Head>
        <Title>{t('boards.title')}</Title>
        <BoardForm busy={actions.creating()} onCreate={actions.create} />
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
            <BoardTile
              key={board.id}
              id={board.id}
              name={board.name}
              summary={board.summary}
              cardCount={board.cardCount}
              deleting={actions.deleting()}
              onOpen={() => navigate(`/boards/${board.id}`)}
              onRename={(name) => void actions.rename(board.id, name, board.name)}
              onDelete={() => actions.remove(board.id)}
            />
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
