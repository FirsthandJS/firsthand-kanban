/**
 * What is at which path, and what a signed-out visitor may see.
 *
 * The guard is an ordinary `if`, because the setup returns a **render
 * function** — a reactive scope of its own, which runs again when the token
 * changes. The setup around it still runs once, which is why the page it
 * guards is built where the setup put it rather than on every check.
 *
 * Before render functions this had to be written as
 * `<>{token.value === null ? … : page()}</>`, with the read pushed into a child
 * position so that it became a part. That worked, and needed a paragraph to
 * explain why it was written that way. This does not.
 */
import { component, type View } from '@firsthandjs/dom';
import { Navigate, route } from '@firsthandjs/router';
import { Board } from '@/features/board/pages/board';
import { Boards } from '@/features/boards/pages/boards';
import { SignIn } from '@/features/session/pages/sign-in';
import { token } from '@/features/session/model';
import { Shell } from '@/app/shell/shell';

const guarded = <P,>(page: (props: P) => View) =>
  component<P>((props) => () => {
    if (token.value === null) {
      return <Navigate to="/sign-in" replace />;
    }
    return page(props as P);
  });

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
        component: guarded(({ params }: { params: { id: string } }) => <Board id={params.id} />),
      }),
      child({ path: '*', component: () => <Navigate to="/" replace /> }),
    ],
  }),
];
