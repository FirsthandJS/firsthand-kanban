/**
 * Register or sign in — one page, because they are one form with one extra
 * field.
 *
 * Worth watching:
 *
 * **Two actions, one form.** `useAction` holds what happened: `running` while
 * it is out, `error` if it failed. Neither needs a signal of its own, and
 * neither can be left set by accident.
 *
 * **The action never rejects.** `run()` resolves with `undefined` on failure,
 * so the `onSubmit` below cannot produce an unhandled rejection however badly
 * the server behaves.
 *
 * **Signing in invalidates `me` and `boards`.** Those tags are in the
 * documents, not here — and the boards page, which has never heard of this
 * form, loads the new account's boards the moment it is shown.
 */
import { component, computed, signal } from '@firsthandjs/dom';
import { useAction } from '@firsthandjs/data';
import { useNavigate } from '@firsthandjs/router';
import LogInDocument from '../gql/log-in.gql';
import RegisterDocument from '../gql/register.gql';
import { graphql } from '../setup/api';
import { t } from '../setup/i18n';
import { signedIn } from '../setup/session';
import { Card, Field, Fields, Footer, Intro, Switcher, Title } from './sign-in.styled';

type Mode = 'sign-in' | 'register';

export const SignIn = component(() => {
  const navigate = useNavigate();
  const mode = signal<Mode>('sign-in');
  const name = signal('');
  const email = signal('');
  const password = signal('');

  const logIn = useAction((_: void, { request }) =>
    graphql.mutate(LogInDocument, { email: email.peek(), password: password.peek() })(request),
  );

  const register = useAction((_: void, { request }) =>
    graphql.mutate(RegisterDocument, {
      name: name.peek(),
      email: email.peek(),
      password: password.peek(),
    })(request),
  );

  // Whichever of the two this form is currently being, as cells: the button's
  // label, its busy state and the message all read from here.
  const busy = computed(() => logIn.running.value || register.running.value);
  const failure = computed(() => {
    const error = mode.value === 'sign-in' ? logIn.error.value : register.error.value;
    return error === null || error === undefined ? null : (error as Error).message;
  });

  const submit = async (event: Event): Promise<void> => {
    event.preventDefault();
    // `run()` never rejects: a failure lands in the action's `error`, which
    // the message above is reading, and resolves with `undefined`.
    if (mode.peek() === 'sign-in') {
      const result = await logIn.run();
      if (result === undefined) {
        return;
      }
      signedIn(result.logIn);
    } else {
      const result = await register.run();
      if (result === undefined) {
        return;
      }
      signedIn(result.register);
    }
    navigate('/');
  };

  const toggle = (): void => {
    mode.value = mode.value === 'sign-in' ? 'register' : 'sign-in';
  };

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

        {failure.value === null ? null : (
          <wa-callout variant="danger">
            <wa-icon slot="icon" name="arrow-right" />
            {failure.value}
          </wa-callout>
        )}

        <Footer>
          <wa-button type="submit" variant="brand" loading={busy.value || undefined}>
            {mode.value === 'sign-in' ? t('signIn.submit') : t('signIn.submitRegister')}
          </wa-button>
          <Switcher type="button" onClick={toggle}>
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
