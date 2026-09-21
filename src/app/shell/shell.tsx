/**
 * The frame every page sits in: a header, and whatever the route matched.
 *
 * The header reads `account.value` and `t(...)`. Signing out empties the first,
 * switching the language re-runs the second — and in both cases the only thing
 * that runs again is the expression that did the reading. The `<Outlet />`
 * beside it, and the board inside that, are not touched.
 */
import { component, computed } from '@firsthandjs/dom';
import { Link, Outlet, useMatches } from '@firsthandjs/router';
import { cache } from '@/shared/api/client';
import { t, toggleLanguage } from '@/shared/i18n';
import { account, signedOut } from '@/features/session/model';
import {
  Bar,
  Brand,
  Main,
  Name,
  Page,
  Quiet,
  Spacer,
  Who,
  Wordmark,
} from '@/app/shell/shell.styled';

export const Shell = component(() => {
  // What the router matched, as a string: the page animation is keyed on it,
  // so it runs once per navigation rather than once per render.
  const matches = useMatches();
  const path = computed(() => matches.value.map((match) => match.pathname).join('|'));

  const signOut = (): void => {
    signedOut();
    // The next account must not read this one's answers. Keys are scoped by
    // account, so this is about the memory rather than about correctness.
    cache.forget();
  };

  return (
    <>
      <Bar>
        <Brand>
          <Link to="/">
            <Wordmark>
              kanban<span>/firsthand</span>
            </Wordmark>
          </Link>
        </Brand>
        <Spacer />

        <Quiet type="button" aria-label={t('nav.languageLabel')} onClick={toggleLanguage}>
          <wa-icon name="globe" />
          {t('nav.language')}
        </Quiet>

        {account.value === null ? null : (
          <Who>
            <wa-avatar label={account.value.name} initials={initials(account.value.name)} />
            <Name>{account.value.name}</Name>
            <Quiet type="button" onClick={signOut}>
              <wa-icon name="logout" />
              {t('nav.signOut')}
            </Quiet>
          </Who>
        )}
      </Bar>
      <Main>
        {/*
         * Keyed by path, so the router's outlet is a new element on every
         * navigation — which is what makes the arrival animation run. Without
         * the key the same node would be reused and nothing would animate.
         */}
        <Page key={path.value}>
          <Outlet />
        </Page>
      </Main>
    </>
  );
});

/** Two letters for the avatar, which is all it has room for. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}
