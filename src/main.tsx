/**
 * Everything this application is set up with, in one place.
 *
 * Three things are application-wide and so are provided here: the theme, the
 * data store, and the routes. There is no provider tower — `provide` is
 * called in the component that owns the value, and `useContext` finds it
 * through the owner tree.
 *
 * Note which of them is *not* here: the cache. It lives in `setup/api.ts`,
 * beside the client, because knowing when two requests are the same thing is
 * a transport's job. The store holds resources and matches tags; it has no
 * memory of its own.
 */
import "./setup/devtools";
import "./setup/webawesome";

import {
  component,
  provide,
  render,
  signal,
  type View,
} from "@firsthandjs/dom";
import { Navigate, Router, route } from "@firsthandjs/router";
import { DataContext, createData } from "@firsthandjs/data";
import { ThemeContext } from "@firsthandjs/styled";
import { Shell } from "./shell/shell";
import { SignIn } from "./pages/sign-in";
import { Boards } from "./pages/boards";
import { Board } from "./pages/board";
import { token } from "./setup/session";
import { theme } from "./setup/theme";

/**
 * A route nobody may see signed out.
 *
 * The read is **inside the JSX**, not in the function body, and that is the
 * whole of what makes it work: a component runs once, so a `return token.value
 * === null ? … : …` up here would decide once, at setup, and a sign-out would
 * leave the page on screen. In a child position the same expression is a part,
 * re-evaluated when the token changes.
 */
const guarded =
  (page: () => View): (() => View) =>
  () => (
    <>{token.value === null ? <Navigate to="/sign-in" replace /> : page()}</>
  );

const Root = component(() => {
  // A signal, not a constant: assigning a new object restyles everything that
  // reads the theme.
  provide(ThemeContext, signal(theme));
  provide(DataContext, createData());

  const routes = [
    route({
      path: "/",
      component: Shell,
      children: (child) => [
        child({ index: true, component: guarded(() => <Boards />) }),
        child({ path: "sign-in", component: SignIn }),
        child({
          // `params.id` is typed from the path, and declared nowhere else.
          path: "boards/:id",
          component: ({ params }) => guarded(() => <Board id={params.id} />)(),
        }),
        child({ path: "*", component: () => <Navigate to="/" replace /> }),
      ],
    }),
  ];

  return <Router routes={routes} />;
});

render(() => <Root />, document.getElementById("root") as HTMLElement);
