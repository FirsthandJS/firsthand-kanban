/** The board list's appearance. Structure is in `boards.tsx`. */
import { styled } from '@firsthandjs/styled';

export const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  min-height: 2.5rem;
  margin-bottom: 1.25rem;
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  margin: 0 auto 0 0;
`;

export const Grid = styled.div<{ $stale?: boolean }>`
  --tile-opacity: ${(props) => (props.$stale === true ? '0.55' : '1')};
  opacity: var(--tile-opacity);
  transition: opacity var(--motion) ease-out;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1rem;
`;

export const Blank = styled.div`
  grid-column: 1 / -1;
  display: grid;
  gap: 0.35rem;
  padding: 2.5rem 1.25rem;
  text-align: center;
  color: var(--wa-color-text-quiet);
  border: 1px dashed var(--wa-color-surface-border);
  border-radius: 12px;

  strong {
    color: var(--wa-color-text-normal);
  }
`;

/** Three tiles of grey while the list is on its way. */
export const Skeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1rem;

  div {
    height: 8.5rem;
    border-radius: 12px;
    background: linear-gradient(
      100deg,
      var(--wa-color-surface-raised) 30%,
      var(--wa-color-surface-border) 50%,
      var(--wa-color-surface-raised) 70%
    );
    background-size: 220% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }

  @keyframes shimmer {
    from {
      background-position: 180% 0;
    }
    to {
      background-position: -40% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    div {
      animation: none;
    }
  }
`;
