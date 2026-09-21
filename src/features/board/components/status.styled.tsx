/** The status dot's appearance. Structure is in `status.tsx`. */
import { styled } from '@firsthandjs/styled';

/**
 * A ring, not a bullet.
 *
 * The first version was a filled dot beside a word, which read as a list item
 * — the browser's own bullet, accidentally reproduced. A ring that closes into
 * a spinner is the shape people already know for "working", and it says the
 * same thing at a tenth of the width.
 */
export const Dot = styled.span<{ $busy?: boolean }>`
  --ring: ${(props) =>
    props.$busy === true ? 'var(--wa-color-brand-fill-loud)' : 'var(--wa-color-surface-border)'};
  --cut: ${(props) => (props.$busy === true ? 'transparent' : 'var(--ring)')};
  display: block;
  width: 0.85rem;
  height: 0.85rem;
  margin: 1.75rem 0 0 auto;
  border-radius: 50%;
  border: 2px solid var(--ring);
  border-top-color: var(--cut);
  animation: ${(props) => (props.$busy === true ? 'turn 0.7s linear infinite' : 'none')};
  transition: border-color var(--motion) ease-out;

  @keyframes turn {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
