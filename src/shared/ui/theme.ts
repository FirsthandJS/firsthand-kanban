/**
 * The theme, which is deliberately thin.
 *
 * Colour comes from Web Awesome's semantic tokens — `--wa-color-surface-raised`,
 * `--wa-color-brand-fill-loud` and friends — read straight out of the CSS in
 * the `.styled.tsx` files. Those tokens flip with the `wa-light` / `wa-dark`
 * class on `<html>`, so a theme that copied them into JavaScript would be a
 * second source of truth that does not flip.
 *
 * What is left is what the application decides rather than the design system:
 * how wide a column is, and which semantic role each kind of card borrows.
 */
import type {} from '@firsthandjs/styled';

declare module '@firsthandjs/styled' {
  // An interface, because this one is *merged* into the library's own
  // declaration — which is the case the keyword exists for.
  interface FirsthandTheme {
    column: string;
    kinds: Readonly<Record<Kind, string>>;
  }
}

/**
 * One duration for every transition in the application, and zero for a person
 * who asked for less movement.
 *
 * It is a custom property on `:root` rather than a value in the theme, because
 * a media query cannot be answered by JavaScript that runs once — and because
 * a rule that writes `var(--motion)` does not have to know the rule exists.
 */
const motion = document.createElement('style');
motion.textContent = `
  :root { --motion: 140ms; }
  @media (prefers-reduced-motion: reduce) { :root { --motion: 0ms; } }
`;
document.head.append(motion);

export type Kind = 'FEATURE' | 'BUG' | 'CHORE';

export const theme = {
  // The smallest a column may be before the row starts scrolling. Four of
  // these plus the gaps fit a laptop; below that, a phone scrolls.
  column: '15.5rem',
  // Roles, not hues: these are the tokens that carry contrast and that flip
  // with the colour scheme.
  kinds: {
    FEATURE: 'var(--wa-color-brand-fill-loud)',
    BUG: 'var(--wa-color-danger-fill-loud)',
    CHORE: 'var(--wa-color-neutral-fill-loud)',
  },
} as const;

/** What a card of each kind is called on screen. */
export const KIND_LABEL: Readonly<Record<Kind, string>> = {
  FEATURE: 'feature',
  BUG: 'bug',
  CHORE: 'chore',
};
