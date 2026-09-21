/**
 * One card: draggable, editable in place, and buttons that appear when you are
 * near it.
 *
 * Editing is the part worth reading.
 *
 * **It ends on purpose, never by accident.** Enter and the check save, Escape
 * and the cross cancel, and clicking away does *neither* — it leaves the field
 * open. Saving on blur meant the only way to keep a change was to guess where
 * to click, and the only way to discard one was to remember what it said.
 *
 * **The new title is on screen before the server has answered.** The board
 * reloads after the mutation, and until it does, `pending` is what is shown —
 * otherwise a card flashes back to its old text for as long as the round trip
 * takes.
 *
 * **A textarea's value is its content, not an attribute.** It is set through
 * the element itself, which is also where the focus and the first measurement
 * happen.
 */
import { component, computed, signal } from '@firsthandjs/dom';
import { t } from '@/shared/i18n';
import type { Kind } from '@/shared/ui/theme';
import { Actions, Edit, Marker, Tile, Title } from './card.styled';

export type CardProps = {
  readonly id: string;
  readonly title: string;
  readonly kind: Kind;
  /** In the first lane: there is nothing to its left. */
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
};

export const CardTile = component<CardProps>((props) => {
  const editing = signal(false);
  const draft = signal('');
  /** What was just saved, until the board comes back carrying it. */
  const pending = signal<string | null>(null);

  const shown = computed(() => {
    const saved = pending.value;
    if (saved === null) {
      return props.title;
    }
    // The answer arrived: stop shadowing it.
    return props.title === saved ? ((pending.value = null), saved) : saved;
  });

  const start = (): void => {
    draft.value = shown.peek();
    editing.value = true;
  };

  const save = (): void => {
    const next = draft.peek().trim();
    editing.value = false;
    if (next !== '' && next !== shown.peek()) {
      pending.value = next;
      props.onRename(next);
    }
  };

  const cancel = (): void => {
    editing.value = false;
  };

  const key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      cancel();
    }
    // Enter saves, Shift+Enter is a new line — which is what a textarea would
    // otherwise do with both.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      save();
    }
  };

  /**
   * The field, as soon as it exists.
   *
   * A textarea holds its value as content rather than as an attribute, so it
   * is written here. `autofocus` is honoured while a *document* loads and does
   * nothing for an element inserted afterwards, so the focus is here too — in
   * an animation frame, because the button that was just clicked takes the
   * focus back otherwise.
   */
  const open = (field: HTMLTextAreaElement): void => {
    field.value = draft.peek();
    grow(field);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(field.value.length, field.value.length);
    });
  };

  /** A textarea exactly as tall as its text, and never shorter than one line. */
  const grow = (field: HTMLTextAreaElement): void => {
    field.style.height = 'auto';
    field.style.height = `${String(Math.max(field.scrollHeight, 20))}px`;
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
      <Marker>{t(`board.kinds.${props.kind}`)}</Marker>

      {editing.value ? (
        <Edit
          onSubmit={(event: Event) => {
            event.preventDefault();
            save();
          }}
        >
          <textarea
            rows={1}
            ref={open}
            aria-label={t('board.edit')}
            onInput={(event: Event) => {
              const field = event.target as HTMLTextAreaElement;
              draft.value = field.value;
              grow(field);
            }}
            onKeyDown={key}
          />
          <span data-actions>
            <button type="button" data-cancel aria-label={t('board.cancel')} onClick={cancel}>
              ✕
            </button>
            <button type="submit" data-save aria-label={t('board.save')}>
              ✓
            </button>
          </span>
        </Edit>
      ) : (
        <Title onDblClick={start}>{shown.value}</Title>
      )}

      <Actions data-hidden={String(editing.value)}>
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
        <button
          type="button"
          aria-label={t('board.edit')}
          disabled={props.busy}
          // The button keeps the focus otherwise, and the field it just opened
          // would sit there empty-looking and unfocused.
          onPointerDown={(event: PointerEvent) => event.preventDefault()}
          onClick={start}
        >
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
