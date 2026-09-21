/**
 * Signing in and registering: the operations, and the rules around them.
 *
 * The page below this knows that there are two of them, that either may fail,
 * and that one of them takes a name. It does not know that they are GraphQL,
 * what they are called on the server, or what to do with what comes back —
 * which is why swapping the transport does not touch a single component.
 */
import { useAction } from '@firsthandjs/data';
import LogInDocument from '@/gql/log-in.gql';
import RegisterDocument from '@/gql/register.gql';
import { graphql } from '@/shared/api/client';
import { signedIn } from '@/features/session/model';

export type Credentials = {
  readonly name: string;
  readonly email: string;
  readonly password: string;
};

/**
 * Both ways in, as one thing.
 *
 * Opening the session — writing the token and the account where the header
 * function can read them — happens here rather than in the form, because it is
 * what signing in *means*. A form that forgot to do it would be a form that
 * looked like it worked.
 */
export function useSignIn() {
  const logIn = useAction((input: Credentials, { request }) =>
    graphql.mutate(LogInDocument, {
      email: input.email,
      password: input.password,
    })(request),
  );

  const register = useAction((input: Credentials, { request }) =>
    graphql.mutate(RegisterDocument, input)(request),
  );

  return {
    /** True while either is out. */
    running: () => logIn.running.value || register.running.value,
    /** Whichever of the two last failed, as a message to show. */
    failure: (mode: 'sign-in' | 'register'): string | null => {
      const error = mode === 'sign-in' ? logIn.error.value : register.error.value;
      return error === null || error === undefined ? null : (error as Error).message;
    },
    /** Runs the one asked for, opens the session, and says whether it worked. */
    submit: async (mode: 'sign-in' | 'register', input: Credentials): Promise<boolean> => {
      if (mode === 'sign-in') {
        const result = await logIn.run(input);
        if (result === undefined) {
          return false;
        }
        signedIn(result.logIn);
        return true;
      }
      const result = await register.run(input);
      if (result === undefined) {
        return false;
      }
      signedIn(result.register);
      return true;
    },
  };
}
