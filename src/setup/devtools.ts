/**
 * Devtools, started before the application builds anything — and only in dev.
 *
 * Its own module because imports are hoisted: `attach()` written among the
 * imports of `main.tsx` would run after every one of them, and a cell created
 * during that evaluation would be recorded without a name. The dynamic import
 * behind `import.meta.env.DEV` keeps the package out of the production bundle.
 *
 * Ctrl+Shift+F opens the panel. On a board, pick a card and the panel names
 * the signal behind it.
 */
if (import.meta.env.DEV) {
  const { attach } = await import('@firsthandjs/devtools');
  attach();
}
