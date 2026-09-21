/** The frame's appearance. Structure is in `shell.tsx`. */
import { styled } from '@firsthandjs/styled';

export const Bar = styled.header`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: var(--wa-color-surface-raised);
  border-bottom: 1px solid var(--wa-color-surface-border);
  /* A thin lit edge, which is as futuristic as a professional tool gets. */
  box-shadow: 0 1px 0 color-mix(in oklab, var(--wa-color-brand-fill-loud) 35%, transparent);
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
  font-size: 1.05rem;
  letter-spacing: -0.01em;

  span {
    color: var(--wa-color-text-quiet);
    font-weight: 400;
  }
`;

export const Spacer = styled.div`
  flex: 1;
`;

export const Name = styled.span`
  color: var(--wa-color-text-quiet);
  font-size: 0.95rem;
`;

export const Main = styled.main`
  padding: 1.5rem 1.25rem 3rem;
  max-width: 78rem;
  margin: 0 auto;
`;
