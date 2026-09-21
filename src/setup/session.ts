/**
 * Who is signed in, as two signals.
 *
 * Nothing here is a store, a context or a provider. A signal read in a part
 * updates that part; a signal read in the transport's header function is read
 * again on the next request. That is the whole of it.
 */
import { batch, signal } from '@firsthandjs/dom';

const STORAGE = 'firsthand-kanban.session';

export interface Account {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

interface Stored {
  readonly token: string;
  readonly account: Account;
}

/** A refresh should not sign you out, and `localStorage` may be unavailable. */
function restore(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw === null ? null : (JSON.parse(raw) as Stored);
  } catch {
    return null;
  }
}

const initial = restore();

export const token = signal<string | null>(initial?.token ?? null);
export const account = signal<Account | null>(initial?.account ?? null);

export function signedIn(next: Stored): void {
  // One update for two cells: a header reading both runs once, not twice.
  batch(() => {
    token.value = next.token;
    account.value = next.account;
  });
  try {
    localStorage.setItem(STORAGE, JSON.stringify(next));
  } catch {
    // A private window without storage still gets a working session, it just
    // does not survive a refresh.
  }
}

export function signedOut(): void {
  batch(() => {
    token.value = null;
    account.value = null;
  });
  try {
    localStorage.removeItem(STORAGE);
  } catch {
    /* as above */
  }
}
