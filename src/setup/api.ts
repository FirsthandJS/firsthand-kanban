/**
 * The transport: one fetch client, one cache, and GraphQL on top of both.
 *
 * There is no GraphQL client library here. `@firsthandjs/data-urql` and
 * `-apollo` exist for the applications that want one — exchanges, normalised
 * caches, subscriptions — and this application wants none of that, so what it
 * has instead is the twenty lines below. Swapping in urql later is one file:
 * `createUrqlClient(client).query(Document, variables)` has the same shape as
 * `graphql.query(...)` does here, deliberately.
 *
 * Two seams carry authentication, and each is a function:
 *
 *   `headers`  is called **per request**, so the current token goes out with
 *              every one of them and nothing is rebuilt when it changes.
 *   `fetch`    wraps the request. A rejected token ending the session is four
 *              lines of it.
 *
 * Silent token refresh, retry-with-backoff or request queueing would all go
 * in that second function, and at three of them a pipeline would start to
 * earn its keep. This application needs none, so it does not have one.
 */
import {
  FirsthandHttpError,
  createCacheClient,
  createFetchClient,
  resolveTags,
  stableKey,
  type DataRequest,
  type DocumentArguments,
  type GraphQLDocument,
  type Loader,
  type Variables,
} from '@firsthandjs/data';
import { account, signedOut, token } from './session';

/**
 * The one cache, at the transport edge.
 *
 * Ten seconds: long enough that moving between the board list and a board is
 * instant, short enough that a second tab is not looking at yesterday. A
 * mutation does not wait for it — an invalidation runs the loader with
 * `force`, which drops the entry rather than being answered out of it.
 */
export const cache = createCacheClient({ ttl: 10_000 });

export const http = createFetchClient({
  cache,
  // Whose answers these are. The client would work this out from the
  // authorization header on its own; saying it explicitly means the cache is
  // keyed by *account*, so two people using this browser in one session can
  // never read each other's boards — and it keeps working if the token is
  // ever refreshed without the account changing.
  scope: () => account.peek()?.id ?? 'anonymous',
  headers: () => {
    // Read here rather than subscribed to: this happens while a request is
    // being sent, and a resource that depended on the token would re-send
    // every query on a sign-out — with an empty header, on its way out.
    const current = token.peek();
    return current === null ? {} : { authorization: `Bearer ${current}` };
  },
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

/** What a GraphQL endpoint answers with. */
interface Answer<T> {
  readonly data?: T;
  readonly errors?: readonly { readonly message: string }[];
}

/** Thrown when the server reports errors rather than data. */
export class GraphQLFailure extends Error {
  constructor(readonly errors: readonly { readonly message: string }[]) {
    super(errors[0]?.message ?? 'The server reported an error');
    this.name = 'GraphQLFailure';
  }
}

function send<T, V extends Variables>(
  kind: 'query' | 'mutation',
  document: GraphQLDocument<T, V>,
  rest: DocumentArguments<V>,
): Loader<T> {
  const variables: Variables = rest[0] ?? {};
  return async (request: DataRequest): Promise<T> => {
    // What the document says it is about. In a resource this lands on the
    // resource's tags; in an action it is the store's invalidation — one
    // call, because the request carries whichever of the two it belongs to.
    request.tags?.(
      ...resolveTags(kind === 'mutation' ? document.invalidates : document.tags, variables),
    );
    const answer = await ask<T>(request, document, variables);
    if (answer.errors !== undefined && answer.errors.length > 0) {
      throw new GraphQLFailure(answer.errors);
    }
    return answer.data as T;
  };
}

/**
 * Sends one operation, and turns a failed status that carries GraphQL errors
 * back into GraphQL errors.
 *
 * A server may answer a domain error with a 4xx — ours answers 401 for a dead
 * token on purpose — and then the body still says what went wrong. Letting the
 * `FirsthandHttpError` through would put "HTTP 400 for /graphql" on the screen
 * where "Use at least eight characters" belongs.
 */
async function ask<T>(
  request: DataRequest,
  document: GraphQLDocument<T, Variables>,
  variables: Variables,
): Promise<Answer<T>> {
  try {
    return await http.post<Answer<T>>('/graphql', {
      json: { query: document.source, variables },
      // A POST is not identified by where it was sent, so a reading one has to
      // say what it is: the operation and its variables, through `stableKey`,
      // which gives the same string whatever order they were written in. A
      // mutation says nothing, and is therefore never cached.
      cacheKey: document.kind === 'query' ? `${document.operation}(${stableKey(variables)})` : false,
    })(request);
  } catch (error: unknown) {
    const body = error instanceof FirsthandHttpError ? error.body : undefined;
    if (isAnswer(body)) {
      return body as Answer<T>;
    }
    throw error;
  }
}

/** Whether a parsed body is a GraphQL answer rather than something else. */
function isAnswer(body: unknown): boolean {
  return typeof body === 'object' && body !== null && 'errors' in body;
}

/**
 * The client, in the shape every `@firsthandjs/data` client has.
 *
 * ```tsx
 * const board = useResource(({ request }) => graphql.query(BoardDocument, { id })(request));
 * const add = useAction((input: Input, { request }) => graphql.mutate(CreateCardDocument, input)(request));
 * ```
 */
export const graphql = {
  query: <T, V extends Variables>(
    document: GraphQLDocument<T, V>,
    ...rest: DocumentArguments<V>
  ): Loader<T> => send('query', document, rest),
  mutate: <T, V extends Variables>(
    document: GraphQLDocument<T, V>,
    ...rest: DocumentArguments<V>
  ): Loader<T> => send('mutation', document, rest),
};
