/**
 * One board: a title, four lanes, and nothing else.
 *
 * What this file does is lay things out and say which state is on screen. It
 * does not know what a mutation is called, what a valid title is, or how a
 * drop becomes a move — `../api` has the operations and `../model` has the
 * drag, and both are testable without a DOM.
 *
 * What is worth reading here:
 *
 * **The resource depends on the id because it read it.** `props.id` is read
 * inside `useBoard`'s loader, so walking from one board to another runs it
 * again and aborts the request that was in flight. Nothing was declared.
 *
 * **Every mutation says what it changed, in its own document.** No component
 * in this feature mentions a tag: an action's request *is* the store's
 * invalidation, so moving a card reloads this board — and only this board.
 *
 * **The four states are four early returns.** The setup returns a render
 * function, which is a reactive scope of its own: the state is read in a
 * statement, so changing it runs this function again — and only this
 * function. Everything else on the page reads the resource inside the markup,
 * so the title, the summary and the lanes are parts that update without the
 * choice above them being made again.
 *
 * **What the run reads is the choice, not the data.** `state` is a `computed`
 * of four names. A reload answers with a new board every time, and this run
 * does not hear about it — the answer is the same name, so nothing above the
 * parts happens at all. Reading `board.data.value` here instead would run
 * this function on every answer, and a run that happens again makes its
 * fragment again: new lanes, new cards, a rebuilt page for a card that moved
 * one column.
 */
import { component, computed } from '@firsthandjs/dom';
import { Link } from '@firsthandjs/router';
import { useBoard, useBoardActions, type Lane as LaneShape } from '@/features/board/api';
import { createDrag } from '@/features/board/model';
import { Lane } from '@/features/board/components/lane';
import { Status } from '@/features/board/components/status';
import { BoardTitle } from '@/features/board/components/title';
import { t } from '@/shared/i18n';
import {
  Back,
  Board as Frame,
  Head,
  Missing,
  Skeleton,
  Summary,
} from '@/features/board/pages/board.styled';

/** The four things this page can be, as one value. */
type State = 'loading' | 'error' | 'missing' | 'board';

export const Board = component<{ id: string }>((props) => {
  const board = useBoard(() => props.id);
  const lanes = computed<readonly LaneShape[]>(() => board.data.value?.board?.columns ?? []);
  const state = computed<State>(() => {
    const status = board.status.value;
    if (status === 'loading') {
      return 'loading';
    }
    if (status === 'error') {
      return 'error';
    }
    return board.data.value?.board == null ? 'missing' : 'board';
  });
  const actions = useBoardActions(
    () => props.id,
    () => lanes.value,
  );
  const drag = createDrag();

  return () => {
    // One read, of a name rather than of the board: a reload that answers
    // with the same name does not reach this function at all.
    const showing = state.value;

    if (showing === 'loading') {
      return (
        <Skeleton aria-hidden="true">
          {[0, 1, 2, 3].map((lane) => (
            <div key={lane}>
              <span />
              <span />
              <span />
              <span />
            </div>
          ))}
        </Skeleton>
      );
    }

    if (showing === 'error') {
      return <wa-callout variant="danger">{(board.error.value as Error).message}</wa-callout>;
    }

    if (showing === 'missing') {
      return (
        <Missing>
          <p>
            <strong>{t('board.missingTitle')}</strong> {t('board.missingBody')}
          </p>
          <Link to="/">← {t('board.back')}</Link>
        </Missing>
      );
    }

    return (
      <>
        <Head>
          <div>
            <Back>
              <Link to="/">← {t('board.back')}</Link>
            </Back>
            <BoardTitle
              name={board.data.value?.board?.name ?? ''}
              onRename={(name) => actions.rename(name, board.data.peek()?.board?.name ?? '')}
            />
            <Summary>{board.data.value?.board?.summary}</Summary>
          </div>
          <Status busy={board.loading.value} />
        </Head>

        <Frame>
          {lanes.value.map((lane, index) => (
            <Lane
              key={lane.id}
              id={lane.id}
              name={lane.name}
              cards={lane.cards}
              first={index === 0}
              last={index === lanes.value.length - 1}
              busy={actions.busy()}
              adding={actions.adding()}
              drag={drag}
              onAdd={(title, kind) => actions.add(lane.id, title, kind)}
              onMove={(cardId, at) => actions.move(cardId, lane.id, at)}
              onShift={(cardId, at, direction) => actions.shift(cardId, at, direction)}
              onEdit={(cardId, title, current) => actions.edit(cardId, title, current)}
              onDelete={(cardId) => actions.remove(cardId)}
            />
          ))}
        </Frame>
      </>
    );
  };
});
