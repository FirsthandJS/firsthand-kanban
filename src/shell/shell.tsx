/**
 * The frame every page sits in: a header, and whatever the route matched.
 *
 * The header reads `account.value`. Sign in and the name appears; sign out and
 * it goes — and the only thing that runs is the expression that read it. The
 * `<Outlet />` beside it is untouched either way.
 */
import { component } from '@firsthandjs/dom';
import { Link, Outlet } from '@firsthandjs/router';
import { cache } from '../setup/api';
import { account, signedOut } from '../setup/session';
import { Bar, Brand, Main, Name, Spacer, Wordmark } from './shell.styled';

export const Shell = component(() => {
  const signOut = (): void => {
    signedOut();
    // The next account must not read this one's answers. The store's
    // resources go with the components; the cache is the transport's, so it
    // is cleared here, explicitly.
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
        {account.value === null ? null : (
          <>
            <wa-avatar label={account.value.name} initials={initials(account.value.name)} />
            <Name>{account.value.name}</Name>
            <wa-button size="small" appearance="plain" onClick={signOut}>
              <wa-icon slot="start" name="logout" />
              Sign out
            </wa-button>
          </>
        )}
      </Bar>
      <Main>
        <Outlet />
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
