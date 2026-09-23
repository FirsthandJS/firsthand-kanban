/**
 * What two clicks do, which is a question the framework stopped answering for
 * us in 0.11.
 *
 * `useAction` used to abort whatever was in flight when a second run started.
 * For a read that is right; for a mutation it is the one policy that can lose
 * a write, because aborting a request does not un-receive it (ADR-0029). The
 * default is now `queue`, and anything else is a sentence at the call site.
 *
 * These assert the two sentences this feature writes: a form does not submit
 * twice, and a rename keeps only the last name typed.
 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, mount } from '@firsthandjs/testing';
import { component, provide } from '@firsthandjs/dom';
import { DataContext, createData } from '@firsthandjs/data';
import { useSignIn } from '@/features/session/api';
import { useBoardActions } from '@/features/boards/api';
import { cache } from '@/shared/api/client';
import { signedIn } from '@/features/session/model';

const original = globalThis.fetch;

/** Operations the server was actually asked to perform. */
let asked: string[] = [];
/** Held open, so a second call arrives while the first is still out. */
let release: (() => void) | null = null;

beforeEach(() => {
  asked = [];
  release = null;
  cache.forget();
  signedIn({ token: 't', account: { id: 'a1', name: 'Ada', email: 'ada@example.com' } });
  globalThis.fetch = (async (input: unknown, init: RequestInit | undefined) => {
    const raw = init?.body ?? (input instanceof Request ? await input.clone().text() : '{}');
    const body = JSON.parse(String(raw)) as { query: string; variables: Record<string, unknown> };
    const name = /(query|mutation)\s+(\w+)/.exec(body.query)?.[2] ?? '?';
    asked.push(name);
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    return new Response(
      JSON.stringify({
        data: {
          logIn: { token: 't', account: { id: 'a1', name: 'Ada', email: 'ada@example.com' } },
          register: { token: 't', account: { id: 'a1', name: 'Ada', email: 'ada@example.com' } },
          renameBoard: { id: 'b1', name: String(body.variables['name'] ?? '') },
        },
      }),
      { headers: { 'content-type': 'application/json' } },
    );
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = original;
  cleanup();
});

/** Mounts a component that only exists to hand its hooks back. */
function using<T>(hook: () => T): T {
  let held: T | undefined;
  const Host = component(() => {
    provide(DataContext, createData());
    held = hook();
    return <i />;
  });
  mount(() => <Host />);
  return held as T;
}

it('submits a sign-in once, however many times it is clicked', async () => {
  const session = using(() => useSignIn());
  const credentials = { name: 'Ada', email: 'ada@example.com', password: 'lovelace-1843' };

  const first = session.submit('sign-in', credentials);
  const second = session.submit('sign-in', credentials);

  // Both callers are waiting on the same run: `drop` hands the second the
  // promise of the first, so neither has to know it was ignored. Under the
  // default this would be two sessions opened for one intent.
  await vi.waitFor(() => {
    expect(asked).toHaveLength(1);
  });
  release?.();
  expect(await first).toBe(true);
  expect(await second).toBe(true);
  expect(asked).toEqual(['LogIn']);
});

it('registers once as well, since that one creates an account', async () => {
  const session = using(() => useSignIn());
  const credentials = { name: 'Ada', email: 'ada@example.com', password: 'lovelace-1843' };

  const first = session.submit('register', credentials);
  const second = session.submit('register', credentials);

  await vi.waitFor(() => {
    expect(asked).toHaveLength(1);
  });
  // Counting while the first is still out cannot tell `drop` from `queue`:
  // under either, the second request has not been sent yet. The answer is
  // after both have settled — one account, not two.
  release?.();
  await first;
  await second;
  expect(asked).toEqual(['Register']);
});

it('keeps the last name typed when a rename is still out', async () => {
  const actions = using(() => useBoardActions());

  void actions.rename('b1', 'First', 'Old');
  await vi.waitFor(() => {
    expect(asked).toHaveLength(1);
  });
  const abandoned = release;
  void actions.rename('b1', 'Second', 'Old');

  // `switch`: the second run aborts the first rather than waiting behind it.
  // A name is one value, so the later one is the answer — and a queue would
  // send a name the visitor has already replaced.
  await vi.waitFor(() => {
    expect(asked).toHaveLength(2);
  });
  abandoned?.();
  release?.();
  expect(asked).toEqual(['RenameBoard', 'RenameBoard']);
});
