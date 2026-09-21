/**
 * One card: draggable, editable in place, and buttons that appear when you are
 * near it.
 *
 * Two things here are worth reading rather than skimming.
 *
 * **Editing is a signal, not a mode.** `editing` flips, the title becomes an
 * input, and the only thing that changes on screen is that one node — the
 * column around it, the cards beside it and the board's scroll position are
 * untouched, because nothing re-rendered.
 *
 * **Dragging is the platform's.** `draggable` plus three handlers; no library,
 * no pointer arithmetic, and the browser draws the drag image. The arrows stay
 * for the keyboard, which is not a fallback so much as the other half of the
 * feature.
 */
import { component, signal } from '@firsthandjs/dom';
import { t } from '../setup/i18n';
import type { Kind } from '../setup/theme';
import { Actions, Edit, Marker, Tile, Title } from './card.styled';

export interface CardProps {
  readonly id: string;
  readonly title: string;
  readonly kind: Kind;
  /** In the first column: there is nothing to its left. */
  readonly first: boolean;
  readonly last: boolean;
  readonly busy: boolean;
  readonly dragging: boolean;
  readonly onBack: () => void;
  readonly onForward: () => void;
  readonly onDelete: () => void;
  readonly onRename: (title: string) => void;
  readonly onDragStart: (event: DragEvent) => void;
  readonly onDragEnd: () => void;
}

export const CardTile = component<CardProps>((props) => {
  const editing = signal(false);
  const draft = signal('');

  const start = (): void => {
    draft.value = props.title;
    editing.value = true;
  };

  const commit = (event: Event): void => {
    event.preventDefault();
    const next = draft.value.trim();
    editing.value = false;
    if (next !== '' && next !== props.title) {
      props.onRename(next);
    }
  };

  const key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      editing.value = false;
    }
    // Enter saves, Shift+Enter is a new line — which is what a textarea would
    // otherwise do with both.
    if (event.key === 'Enter' && !event.shiftKey) {
      commit(event);
    }
  };

  /**
   * Focus, by hand.
   *
   * `autofocus` is an attribute the browser honours while a document loads,
   * and this field is inserted long after that — so it does nothing here. The
   * element is handed over as soon as it exists, which is what `ref` is for.
   */
  const focusOn = (field: HTMLTextAreaElement): void => {
    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);
    grow(field);
  };

  /** A textarea that is exactly as tall as its text. */
  const grow = (field: HTMLTextAreaElement): void => {
    field.style.height = 'auto';
    field.style.height = `${String(field.scrollHeight)}px`;
  };

  return (
    <Tile
      $kind={props.kind}
      $dragging={props.dragging}
      draggable={!editing.value}
      data-card={props.id}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
      <Marker>{t(`kind.${props.kind}`)}</Marker>

      {editing.value ? (
        <Edit onSubmit={commit}>
          {/*
           * A textarea, not an input: a card's title wraps onto three lines
           * when it needs to, and editing it should not squeeze it onto one.
           * It grows with what is typed, so the card does not either.
           */}
          <textarea
            rows={1}
            value={draft.value}
            aria-label={t('board.edit')}
            ref={focusOn}
            onInput={(event: Event) => {
              const field = event.target as HTMLTextAreaElement;
              draft.value = field.value;
              grow(field);
            }}
            onKeyDown={key}
            onBlur={commit}
          />
        </Edit>
      ) : (
        <Title onDblClick={start}>{props.title}</Title>
      )}

      <Actions>
        <button
          type="button"
          aria-label={t('board.moveLeft')}
          disabled={props.first || props.busy}
          onClick={props.onBack}
        >
          ←
        </button>
        <button
          type="button"
          aria-label={t('board.moveRight')}
          disabled={props.last || props.busy}
          onClick={props.onForward}
        >
          →
        </button>
        <button type="button" aria-label={t('board.edit')} disabled={props.busy} onClick={start}>
          <wa-icon name="pencil" />
        </button>
        <button
          type="button"
          aria-label={t('board.delete')}
          disabled={props.busy}
          onClick={props.onDelete}
        >
          <wa-icon name="trash" />
        </button>
      </Actions>
    </Tile>
  );
});
