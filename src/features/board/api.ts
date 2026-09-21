/**
 * One board, and everything that can be done to the cards on it.
 *
 * The rules are here rather than in a click handler: a card needs a title, a
 * move clamps to the end of the column it lands in, and a rename that changes
 * nothing is not a request. None of that is about markup, and all of it is
 * testable without a DOM.
 */
import { useAction, useResource } from '@firsthandjs/data';
import BoardDocument from '@/features/board/gql/board.gql';
import CreateCardDocument from '@/features/board/gql/create-card.gql';
import DeleteCardDocument from '@/features/board/gql/delete-card.gql';
import EditCardDocument from '@/features/board/gql/edit-card.gql';
import MoveCardDocument from '@/features/board/gql/move-card.gql';
import RenameBoardDocument from '@/features/boards/gql/rename-board.gql';
import { graphql } from '@/shared/api/client';
import type { Kind } from '@/shared/ui/theme';

/** A thunk, because the id changes when you walk to another board. */
export type BoardId = () => string;

/**
 * The board itself.
 *
 * `id()` is read *inside* the loader, which is what makes the resource depend
 * on it: walking from one board to another runs it again and aborts the
 * request that was in flight.
 */
export function useBoard(id: BoardId) {
  return useResource(({ request }) => graphql.query(BoardDocument, { id: id() })(request));
}

export type Lane = {
  readonly id: string;
  readonly name: string;
  readonly cards: readonly {
    readonly id: string;
    readonly title: string;
    readonly kind: string;
  }[];
};

export function useBoardActions(id: BoardId, lanes: () => readonly Lane[]) {
  const add = useAction((input: { columnId: string; title: string; kind: Kind }, { request }) =>
    graphql.mutate(CreateCardDocument, { boardId: id(), ...input })(request),
  );

  const move = useAction(
    (input: { cardId: string; toColumnId: string; toIndex: number }, { request }) =>
      graphql.mutate(MoveCardDocument, { boardId: id(), ...input })(request),
  );

  const edit = useAction((input: { cardId: string; title: string }, { request }) =>
    graphql.mutate(EditCardDocument, { boardId: id(), ...input })(request),
  );

  const remove = useAction((cardId: string, { request }) =>
    graphql.mutate(DeleteCardDocument, { boardId: id(), cardId })(request),
  );

  const rename = useAction((name: string, { request }) =>
    graphql.mutate(RenameBoardDocument, { boardId: id(), name })(request),
  );

  return {
    /** True while anything that changes a card is out. */
    busy: () => move.running.value || remove.running.value || edit.running.value,
    adding: () => add.running.value,

    /** Adds a card, unless there is nothing to add. */
    add: async (columnId: string, title: string, kind: Kind): Promise<boolean> => {
      const wanted = title.trim();
      return wanted === ''
        ? false
        : (await add.run({ columnId, title: wanted, kind })) !== undefined;
    },

    /** Moves a card to a column, landing at `index` or at the end of it. */
    move: (cardId: string, toColumnId: string, index: number): void => {
      const to = lanes().find((lane) => lane.id === toColumnId);
      if (to === undefined) {
        return;
      }
      void move.run({
        cardId,
        toColumnId,
        toIndex: Math.max(0, Math.min(index, to.cards.length)),
      });
    },

    /** Moves a card one lane along, which is what the arrow buttons do. */
    shift: (cardId: string, index: number, direction: 1 | -1): void => {
      const all = lanes();
      const from = all.findIndex((lane) => lane.cards.some((card) => card.id === cardId));
      const to = all[from + direction];
      if (to === undefined) {
        return;
      }
      void move.run({
        cardId,
        toColumnId: to.id,
        toIndex: Math.min(index, to.cards.length),
      });
    },

    /** Renames a card, unless the title is empty or unchanged. */
    edit: (cardId: string, title: string, current: string): void => {
      const wanted = title.trim();
      if (wanted !== '' && wanted !== current) {
        void edit.run({ cardId, title: wanted });
      }
    },

    remove: (cardId: string): void => {
      void remove.run(cardId);
    },

    /** Renames the board, unless the name is empty or unchanged. */
    rename: (name: string, current: string): void => {
      const wanted = name.trim();
      if (wanted !== '' && wanted !== current) {
        void rename.run(wanted);
      }
    },
  };
}
