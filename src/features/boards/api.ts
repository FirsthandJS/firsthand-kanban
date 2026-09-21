/**
 * The board list: what it is, and the four things that can happen to it.
 *
 * Every rule about a board's name lives here — trimmed, non-empty, and a
 * rename that changes nothing is not a request. A component asking for
 * `create('  ')` gets `false` and no network traffic, which is the sort of
 * thing that is otherwise repeated in three event handlers and forgotten in a
 * fourth.
 */
import { useAction, useResource } from '@firsthandjs/data';
import BoardsDocument from '@/gql/boards.gql';
import CreateBoardDocument from '@/gql/create-board.gql';
import DeleteBoardDocument from '@/gql/delete-board.gql';
import RenameBoardDocument from '@/gql/rename-board.gql';
import { fresh, graphql } from '@/shared/api/client';

/** The boards this account owns. */
export function useBoards() {
  // Uncached: nobody is watching this list while you are inside a board, so an
  // invalidation from there reaches nothing — see `shared/api/client.ts`.
  return useResource(({ request }) => fresh().query(BoardsDocument)(request));
}

export function useBoardActions() {
  const create = useAction((name: string, { request }) =>
    graphql.mutate(CreateBoardDocument, { name })(request),
  );

  const rename = useAction((input: { boardId: string; name: string }, { request }) =>
    graphql.mutate(RenameBoardDocument, input)(request),
  );

  const remove = useAction((boardId: string, { request }) =>
    graphql.mutate(DeleteBoardDocument, { boardId })(request),
  );

  return {
    creating: () => create.running.value,
    deleting: () => remove.running.value,

    /** Adds one, unless there is nothing to add. */
    create: async (name: string): Promise<boolean> => {
      const wanted = name.trim();
      return wanted === '' ? false : (await create.run(wanted)) !== undefined;
    },

    /** Renames one, unless the name is empty or unchanged. */
    rename: async (boardId: string, name: string, current: string): Promise<void> => {
      const wanted = name.trim();
      if (wanted !== '' && wanted !== current) {
        await rename.run({ boardId, name: wanted });
      }
    },

    remove: (boardId: string): void => {
      void remove.run(boardId);
    },
  };
}
