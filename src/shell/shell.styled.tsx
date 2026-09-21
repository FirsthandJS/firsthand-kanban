/** The frame's appearance. Structure is in `shell.tsx`. */
import { styled } from '@firsthandjs/styled';

export const Bar = styled.header`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.25rem;
  background: color-mix(in oklab, var(--wa-color-surface-raised) 85%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--wa-color-surface-border);
  /* A thin lit edge, which is as futuristic as a professional tool gets. */
  box-shadow: 0 1px 0 color-mix(in oklab, var(--wa-color-brand-fill-loud) 30%, transparent);
  position: sticky;
  top: 0;
  z-index: 10;
`;

export const Brand = styled.div`
  a {
    text-decoration: none;
    color: inherit;
  }
`;

export const Wordmark = styled.strong`
  font-size: 1.02rem;
  letter-spacing: -0.01em;

  span {
    color: var(--wa-color-text-quiet);
    font-weight: 400;
  }
`;

export const Spacer = styled.div`
  flex: 1;
`;

/**
 * The account, as one group.
 *
 * The avatar is sized to the text beside it rather than to its own default,
 * which is what made it look pasted on: 1.6rem is the cap height of the name
 * plus a little, and `--size` is the property Web Awesome exposes for exactly
 * this.
 */
export const Who = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 0.6rem;
  border-left: 1px solid var(--wa-color-surface-border);

  wa-avatar {
    --size: 1.6rem;
  }
`;

export const Name = styled.span`
  color: var(--wa-color-text-normal);
  font-size: 0.9rem;
  font-weight: 550;

  @media (max-width: 34rem) {
    display: none;
  }
`;

/** A header button: quiet until you are on it. */
export const Quiet = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font: inherit;
  font-size: 0.85rem;
  line-height: 1;
  padding: 0.4rem 0.6rem;
  color: var(--wa-color-text-quiet);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition:
    color var(--motion) ease-out,
    background var(--motion) ease-out,
    border-color var(--motion) ease-out;

  &:hover {
    color: var(--wa-color-text-normal);
    background: var(--wa-color-surface-default);
    border-color: var(--wa-color-surface-border);
  }

  &:focus-visible {
    outline: 2px solid var(--wa-color-brand-fill-loud);
    outline-offset: 1px;
  }
`;

export const Main = styled.main`
  padding: 1.5rem 1.25rem 3rem;
  max-width: 82rem;
  margin: 0 auto;
`;
