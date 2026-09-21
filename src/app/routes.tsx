/**
 * What is at which path, and what a signed-out visitor may see.
 *
 * The guard reads `token.value` **inside the JSX**, not in the function body,
 * and that is the whole of what makes it work: a component runs once, so a
 * `return token.value === null ? … : …` up here would decide once and a
 * sign-out would leave the page on screen. In a child position the same
 * expression is a part, re-evaluated when the token changes.
 */
import { type View } from '@firsthandjs/dom';
import { Navigate, route } from '@firsthandjs/router';
import { Board } from '@/features/board/pages/board';
import { Boards } from '@/features/boards/pages/boards';
import { SignIn } from '@/features/session/pages/sign-in';
import { token } from '@/features/session/model';
import { Shell } from '@/app/shell/shell';

const guarded =
  (page: () => View): (() => View) =>
  () => <>{token.value === null ? <Navigate to="/sign-in" replace /> : page()}</>;

export const routes = [
  route({
    path: '/',
    component: Shell,
    children: (child) => [
      child({ index: true, component: guarded(() => <Boards />) }),
      child({ path: 'sign-in', component: SignIn }),
      child({
        // `params.id` is typed from the path, and declared nowhere else.
        path: 'boards/:id',
        component: ({ params }) => guarded(() => <Board id={params.id} />)(),
      }),
      child({ path: '*', component: () => <Navigate to="/" replace /> }),
    ],
  }),
];
