/**
 * One board in the list: its name, what it holds, and the two things you can
 * do to it without opening it.
 *
 * Renaming and the delete question are local to a tile — no other tile and no
 * page needs to know which one is mid-question. What leaves is a new name, or
 * the decision to remove it.
 */
import { component, signal } from '@firsthandjs/dom';
import { t } from '@/shared/i18n';
import { Confirm, Count, Name, Rename, Summary, Tile as Frame } from './tile.styled';

export type TileProps = {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly cardCount: number;
  readonly deleting: boolean;
  readonly onOpen: () => void;
  readonly onRename: (name: string) => void;
  readonly onDelete: () => void;
};

export const BoardTile = component<TileProps>((props) => {
  const editing = signal(false);
  const asking = signal(false);
  const draft = signal('');

  const startEditing = (event: Event): void => {
    event.stopPropagation();
    draft.value = props.name;
    editing.value = true;
  };

  const commit = (event: Event): void => {
    event.preventDefault();
    editing.value = false;
    props.onRename(draft.value);
  };

  const focusField = (field: HTMLInputElement): void => {
    field.focus();
    field.select();
  };

  return (
    <Frame
      data-board={props.id}
      tabindex={0}
      role="link"
      aria-label={`${t('boards.open')}: ${props.name}`}
      onClick={(event: MouseEvent) => {
        // A click on the pencil, the input or a button inside is not a click
        // on the tile.
        if ((event.target as HTMLElement).closest('button, input, form') === null) {
          props.onOpen();
        }
      }}
      onKeyDown={(event: KeyboardEvent) => {
        // Only when the tile itself has focus: Enter inside the rename field
        // submits that field, and it bubbles to here.
        if (event.target !== event.currentTarget) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          props.onOpen();
        }
      }}
    >
      {editing.value ? (
        <Rename onClick={(event: Event) => event.stopPropagation()} onSubmit={commit}>
          <input
            value={draft.value}
            ref={focusField}
            aria-label={t('boards.rename')}
            onInput={(event: Event) => (draft.value = (event.target as HTMLInputElement).value)}
            onBlur={commit}
            onKeyDown={(event: KeyboardEvent) => {
              if (event.key === 'Escape') {
                editing.value = false;
              }
            }}
          />
        </Rename>
      ) : (
        <Name>
          {props.name}
          <button type="button" aria-label={t('boards.rename')} onClick={startEditing}>
            <wa-icon name="pencil" />
          </button>
          <button
            type="button"
            data-delete
            aria-label={t('boards.delete')}
            onClick={(event: Event) => {
              event.stopPropagation();
              asking.value = true;
            }}
          >
            <wa-icon name="trash" />
          </button>
        </Name>
      )}

      {asking.value ? (
        // A question rather than a dialog: it is one board, the answer is one
        // click, and a modal for that is theatre.
        <Confirm onClick={(event: Event) => event.stopPropagation()}>
          <span>{t('boards.confirm')}</span>
          <button type="button" data-quiet onClick={() => (asking.value = false)}>
            {t('boards.confirmNo')}
          </button>
          <button
            type="button"
            data-danger
            disabled={props.deleting}
            onClick={() => {
              asking.value = false;
              props.onDelete();
            }}
          >
            {t('boards.confirmYes')}
          </button>
        </Confirm>
      ) : (
        <Summary>{props.summary}</Summary>
      )}

      <Count>
        <span>{props.cardCount}</span>
        {t('boards.cards', { count: props.cardCount })}
      </Count>
    </Frame>
  );
});
