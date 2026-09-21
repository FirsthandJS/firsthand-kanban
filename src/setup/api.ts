/**
 * The transport: urql, bound to the data layer by `@firsthandjs/data-urql`.
 *
 * The client is built here, with everything a GraphQL client is for — the URL,
 * the exchanges, the headers, the one place a rejected token ends a session.
 * `createUrqlClient` then binds two of its methods and adds what the resource
 * layer needs: the abort signal, the cache, and the document's own `@tag` /
 * `@invalidates` directives reported into the request.
 *
 * Nothing in this file parses GraphQL, posts JSON or unwraps an answer. That
 * was twenty lines once, and twenty lines is exactly how a project ends up
 * maintaining a client it never meant to write.
 *
 * Two seams carry authentication, and each is a function:
 *
 *   `headers`     is read **per request**, so the current token goes out with
 *                 every one of them and nothing is rebuilt when it changes.
 *   `fetch`       wraps the request. A rejected token ending the session is
 *                 four lines of it, and urql takes the wrapper as an option.
 *
 * Silent token refresh or retry-with-backoff would go in that wrapper, and at
 * three of them urql's exchanges would start to earn their keep. This
 * application needs none, so it has `fetchExchange` and nothing else.
 */
import { Client, fetchExchange } from '@urql/core';
import { createCacheClient } from '@firsthandjs/data';
import { createUrqlClient } from '@firsthandjs/data-urql';
import { account, signedOut, token } from './session';

/**
 * The one cache, at the transport edge.
 *
 * Ours rather than urql's `cacheExchange`, and that is the decision to notice:
 * a normalising cache and a store of resources are two answers to "what is the
 * current state", and two answers disagree. So urql is the transport, the
 * resources are the state, and this holds the answers for ten seconds —
 * long enough that walking from the board list into a board and back is free.
 *
 * An invalidation reaches through it, because an invalidated run is `force`d.
 */
export const cache = createCacheClient({ ttl: 10_000 });

const client = new Client({
  url: '/graphql',
  exchanges: [fetchExchange],
  fetch: async (input, init) => {
    const response = await fetch(input, init);
    // The server answers 401 rather than a 200 with an error in the body,
    // which is what makes this one check rather than one per operation.
    if (response.status === 401 && token.peek() !== null) {
      signedOut();
      cache.forget();
    }
    return response;
  },
});

export const graphql = createUrqlClient(client, {
  headers: () => {
    // `peek`, not `.value`: this runs while a request is being sent, and a
    // resource that depended on the token would re-send every query on a
    // sign-out — with an empty header, on its way out.
    const current = token.peek();
    return current === null ? {} : { authorization: `Bearer ${current}` };
  },
  cache,
  // Whose answers these are. The client would work this out from the
  // authorization header on its own; saying it explicitly keys the cache by
  // *account*, so two people at one browser can never read each other's
  // boards, and a refreshed token does not throw the cache away.
  scope: () => account.peek()?.id ?? 'anonymous',
});

/**
 * The board list, without the cache.
 *
 * An invalidation reaches every resource that is *alive*. Nobody is watching
 * the list while you are inside a board, so moving a card invalidates nothing
 * there — and walking back within the cache's ten seconds was answered with
 * the counts from before the move.
 *
 * This is a real gap between the two layers rather than a bug in either, and
 * it is being discussed rather than papered over in the framework. Here the
 * honest answer is that a list of five boards is cheap and has to be right:
 * `.with({ cache: false })` says so in one line, and the cached client still
 * serves everything else.
 */
export const fresh = () => graphql.with({ cache: false });
