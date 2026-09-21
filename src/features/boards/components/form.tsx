/**
 * The new-board form, which is not there until it is asked for.
 *
 * A permanent input in a header is a permanent suggestion that something is
 * missing. The draft lives here; what leaves is one name.
 */
import { component, signal } from '@firsthandjs/dom';
import { t } from '@/shared/i18n';
import { Create, New } from '@/features/boards/components/form.styled';

export type FormProps = {
  readonly busy: boolean;
  readonly onCreate: (name: string) => Promise<boolean>;
};

export const BoardForm = component<FormProps>((props) => {
  const open = signal(false);
  const name = signal('');

  const focusField = (field: HTMLInputElement): void => {
    field.focus();
  };

  const submit = async (event: Event): Promise<void> => {
    event.preventDefault();
    const created = await props.onCreate(name.value);
    if (created) {
      name.value = '';
      open.value = false;
    }
  };

  // Wrapped in a fragment on purpose: `return open.value ? … : …` would be
  // evaluated once, because a component runs once. In a child position it is
  // a part, and the form appears when the button is pressed.
  return (
    <>
      {open.value ? (
        <Create onSubmit={(event: Event) => void submit(event)}>
          <input
            value={name.value}
            ref={focusField}
            placeholder={t('boards.newPlaceholder')}
            aria-label={t('boards.new')}
            onInput={(event: Event) => (name.value = (event.target as HTMLInputElement).value)}
            onKeyDown={(event: KeyboardEvent) => {
              if (event.key === 'Escape') {
                open.value = false;
              }
            }}
          />
          <button type="button" data-quiet onClick={() => (open.value = false)}>
            {t('boards.cancel')}
          </button>
          <button type="submit" data-submit disabled={props.busy}>
            {t('boards.add')}
          </button>
        </Create>
      ) : (
        <New
          type="button"
          onClick={() => {
            name.value = '';
            open.value = true;
          }}
        >
          <wa-icon name="plus" />
          {t('boards.new')}
        </New>
      )}
    </>
  );
});
