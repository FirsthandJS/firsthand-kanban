/**
 * The form that adds a card: a title, a kind, and two buttons.
 *
 * It owns the draft and nothing else — the lane above it does not want to know
 * what is half-typed, and the feature below it does not want to know there is
 * a form. What it hands back is a title and a kind.
 */
import { component, signal } from '@firsthandjs/dom';
import { t } from '@/shared/i18n';
import { KIND_LABEL, type Kind } from '@/shared/ui/theme';
import { Compose, Kinds } from '@/features/board/components/composer.styled';

export type ComposerProps = {
  readonly busy: boolean;
  readonly onAdd: (title: string, kind: Kind) => void;
  readonly onCancel: () => void;
};

export const Composer = component<ComposerProps>((props) => {
  const title = signal('');
  const kind = signal<Kind>('FEATURE');

  /**
   * Focus, by hand. `autofocus` is honoured while a document loads, and this
   * field is inserted long after that.
   */
  const focusField = (field: HTMLInputElement): void => {
    field.focus();
  };

  return (
    <Compose
      onSubmit={(event: Event) => {
        event.preventDefault();
        props.onAdd(title.value, kind.value);
      }}
    >
      <input
        value={title.value}
        ref={focusField}
        placeholder={t('board.cardPlaceholder')}
        aria-label={t('board.cardPlaceholder')}
        onInput={(event: Event) => (title.value = (event.target as HTMLInputElement).value)}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            props.onCancel();
          }
        }}
      />
      <Kinds>
        <span data-kinds>
          {(Object.keys(KIND_LABEL) as Kind[]).map((one) => (
            <button
              key={one}
              type="button"
              data-kind={one}
              data-active={String(kind.value === one)}
              onClick={() => (kind.value = one)}
            >
              {t(`board.kinds.${one}`)}
            </button>
          ))}
        </span>
        <span />
        <button type="button" data-quiet onClick={props.onCancel}>
          {t('board.cancel')}
        </button>
        <button type="submit" data-submit disabled={props.busy}>
          {t('board.addCardSubmit')}
        </button>
      </Kinds>
    </Compose>
  );
});
