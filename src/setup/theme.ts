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
  interface FirsthandTheme {
    column: string;
    kinds: Readonly<Record<Kind, string>>;
  }
}

export type Kind = 'FEATURE' | 'BUG' | 'CHORE';

export const theme = {
  column: '19rem',
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
