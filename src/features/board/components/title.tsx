/**
 * The board's name, and the two ways to change it: double-click, or the pencil
 * that appears when you are near it.
 *
 * The draft is local. What leaves this component is one string, once, and only
 * when it differs from what was there.
 */
import { component, signal } from '@firsthandjs/dom';
import { t } from '@/shared/i18n';
import { Rename, Title as Heading, Titles } from '@/features/board/components/title.styled';

export type TitleProps = {
  readonly name: string;
  readonly onRename: (name: string) => void;
};

export const BoardTitle = component<TitleProps>((props) => {
  const editing = signal(false);
  const draft = signal('');

  const start = (): void => {
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
    <Titles>
      {editing.value ? (
        <Rename onSubmit={commit}>
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
        <Heading onDblClick={start}>{props.name}</Heading>
      )}
      <button type="button" data-rename aria-label={t('boards.rename')} onClick={start}>
        <wa-icon name="pencil" />
      </button>
    </Titles>
  );
});
