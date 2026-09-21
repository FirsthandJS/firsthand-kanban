/**
 * Register or sign in — one page, because they are one form with one extra
 * field.
 *
 * What this file decides is what is on screen. Whether a submission succeeded,
 * and what opening a session means, is `../api` — so this page never touches
 * a token and cannot forget to.
 */
import { component, signal } from '@firsthandjs/dom';
import { useNavigate } from '@firsthandjs/router';
import { useSignIn } from '@/features/session/api';
import { t } from '@/shared/i18n';
import { Card, Field, Fields, Footer, Intro, Switcher, Title } from './sign-in.styled';

type Mode = 'sign-in' | 'register';

export const SignIn = component(() => {
  const navigate = useNavigate();
  const session = useSignIn();

  const mode = signal<Mode>('sign-in');
  const name = signal('');
  const email = signal('');
  const password = signal('');

  const submit = async (event: Event): Promise<void> => {
    event.preventDefault();
    const opened = await session.submit(mode.peek(), {
      name: name.peek(),
      email: email.peek(),
      password: password.peek(),
    });
    if (opened) {
      navigate('/');
    }
  };

  const failure = (): string | null => session.failure(mode.value);

  return (
    <Card>
      <Title>{mode.value === 'sign-in' ? t('signIn.title') : t('signIn.titleRegister')}</Title>
      <Intro>{t('signIn.intro')}</Intro>

      <form onSubmit={(event: Event) => void submit(event)}>
        <Fields>
          {mode.value === 'register' ? (
            <Field>
              <wa-input
                label={t('signIn.name')}
                value={name.value}
                required
                autocomplete="name"
                onInput={(event: Event) => (name.value = valueOf(event))}
              />
            </Field>
          ) : null}
          <Field>
            <wa-input
              label={t('signIn.email')}
              type="email"
              value={email.value}
              required
              autocomplete="email"
              onInput={(event: Event) => (email.value = valueOf(event))}
            />
          </Field>
          <Field>
            <wa-input
              label={t('signIn.password')}
              type="password"
              value={password.value}
              required
              password-toggle
              hint={mode.value === 'register' ? t('signIn.passwordHint') : undefined}
              autocomplete="current-password"
              onInput={(event: Event) => (password.value = valueOf(event))}
            />
          </Field>
        </Fields>

        {failure() === null ? null : (
          <wa-callout variant="danger">
            <wa-icon slot="icon" name="arrow-right" />
            {failure()}
          </wa-callout>
        )}

        <Footer>
          <wa-button type="submit" variant="brand" loading={session.running() || undefined}>
            {mode.value === 'sign-in' ? t('signIn.submit') : t('signIn.submitRegister')}
          </wa-button>
          <Switcher
            type="button"
            onClick={() => (mode.value = mode.value === 'sign-in' ? 'register' : 'sign-in')}
          >
            {mode.value === 'sign-in' ? t('signIn.needAccount') : t('signIn.haveAccount')}
          </Switcher>
        </Footer>
      </form>
    </Card>
  );
});

/** What a `<wa-input>` is holding, which is the value of its inner input. */
function valueOf(event: Event): string {
  return (event.target as HTMLInputElement).value;
}
