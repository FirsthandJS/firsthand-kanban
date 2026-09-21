/**
 * One lane: a heading, its cards, and the one place a card can be added.
 *
 * It is a drop target and nothing more clever than that — `dragover` has to
 * call `preventDefault()` or the browser refuses the drop, which is the only
 * surprise the platform's drag and drop has.
 */
import { component, signal } from '@firsthandjs/dom';
import { dropIndex, type Drag } from '@/features/board/model';
import { t } from '@/shared/i18n';
import type { Kind } from '@/shared/ui/theme';
import { CardTile } from '@/features/board/components/card';
import { Composer } from '@/features/board/components/composer';
import { Column, ColumnHead, Count, Name, Slot } from '@/features/board/components/lane.styled';

export type LaneCard = {
  readonly id: string;
  readonly title: string;
  readonly kind: string;
};

export type LaneProps = {
  readonly id: string;
  readonly name: string;
  readonly cards: readonly LaneCard[];
  readonly first: boolean;
  readonly last: boolean;
  readonly busy: boolean;
  readonly adding: boolean;
  readonly drag: Drag;
  readonly onAdd: (title: string, kind: Kind) => Promise<boolean>;
  readonly onMove: (cardId: string, index: number) => void;
  readonly onShift: (cardId: string, index: number, direction: 1 | -1) => void;
  readonly onEdit: (cardId: string, title: string, current: string) => void;
  readonly onDelete: (cardId: string) => void;
};

export const Lane = component<LaneProps>((props) => {
  /** Whether this lane's composer is open. Nobody else's business. */
  const composing = signal(false);

  return (
    <Column
      $over={props.drag.over() === props.id}
      onDragOver={(event: DragEvent) => {
        // Without this the browser refuses the drop.
        event.preventDefault();
        props.drag.enter(props.id);
      }}
      onDragLeave={() => props.drag.leave(props.id)}
      onDrop={(event: DragEvent) => {
        event.preventDefault();
        const cardId = props.drag.drop();
        if (cardId !== null) {
          props.onMove(cardId, dropIndex(event, props.cards));
        }
      }}
    >
      <ColumnHead>
        <Name>{props.name}</Name>
        <Count>{props.cards.length}</Count>
      </ColumnHead>

      <Slot>
        {props.cards.map((card, index) => (
          <CardTile
            key={card.id}
            id={card.id}
            title={card.title}
            kind={card.kind as Kind}
            first={props.first}
            last={props.last}
            busy={props.busy}
            dragging={props.drag.held() === card.id}
            onBack={() => props.onShift(card.id, index, -1)}
            onForward={() => props.onShift(card.id, index, 1)}
            onDelete={() => props.onDelete(card.id)}
            onRename={(title) => props.onEdit(card.id, title, card.title)}
            onDragStart={(event: DragEvent) => {
              props.drag.start(card.id);
              event.dataTransfer?.setData('text/plain', card.id);
            }}
            onDragEnd={() => props.drag.end()}
          />
        ))}
      </Slot>

      {composing.value ? (
        <Composer
          busy={props.adding}
          onCancel={() => (composing.value = false)}
          onAdd={async (title, kind) => {
            const added = await props.onAdd(title, kind);
            if (added) {
              composing.value = false;
            }
          }}
        />
      ) : (
        <button type="button" data-add onClick={() => (composing.value = true)}>
          <wa-icon name="plus" /> {t('board.addCard')}
        </button>
      )}
    </Column>
  );
});
