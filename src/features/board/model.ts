/**
 * The drag, as state rather than as four handlers spread over two components.
 *
 * Two signals: what is being held, and what it is over. A lane asks "am I the
 * one?" and a card asks "am I the one being held?", and neither needs to know
 * about the other. `drop` answers the only real question — which card, into
 * which lane, at which index — and hands it to whoever was given the board's
 * actions.
 */
import { signal } from '@firsthandjs/dom';

export type Drag = {
  readonly held: () => string | null;
  readonly over: () => string | null;
  start: (cardId: string) => void;
  enter: (laneId: string) => void;
  leave: (laneId: string) => void;
  end: () => void;
  /** The card that was dropped, or `null` when nothing was being dragged. */
  drop: () => string | null;
};

export function createDrag(): Drag {
  const held = signal<string | null>(null);
  const over = signal<string | null>(null);

  return {
    held: () => held.value,
    over: () => over.value,
    start: (cardId) => {
      held.value = cardId;
    },
    enter: (laneId) => {
      over.value = laneId;
    },
    leave: (laneId) => {
      if (over.peek() === laneId) {
        over.value = null;
      }
    },
    end: () => {
      held.value = null;
      over.value = null;
    },
    drop: () => {
      const cardId = held.peek();
      held.value = null;
      over.value = null;
      return cardId;
    },
  };
}

/** Where in a lane a drop landed: above the card it was dropped on. */
export function dropIndex(event: DragEvent, cards: readonly { readonly id: string }[]): number {
  const target = (event.target as HTMLElement | null)?.closest('[data-card]');
  const id = target?.getAttribute('data-card');
  const at = cards.findIndex((card) => card.id === id);
  return at === -1 ? cards.length : at;
}
