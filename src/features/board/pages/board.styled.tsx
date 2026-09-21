/** The board page's appearance. Structure is in `board.tsx`. */
import { styled } from '@firsthandjs/styled';

export const Head = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

export const Back = styled.div`
  font-size: 0.85rem;
  margin-bottom: 0.3rem;

  a {
    color: var(--wa-color-text-quiet);
    text-decoration: none;
    transition: color var(--motion) ease-out;
  }

  a:hover {
    color: var(--wa-color-text-normal);
  }
`;

export const Summary = styled.p`
  color: var(--wa-color-text-quiet);
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
`;

/**
 * Four columns side by side, with no horizontal scrollbar on a desktop.
 *
 * `auto-fit` with `minmax` is what does it: the columns share the width they
 * have and stop shrinking at a readable minimum, at which point — a phone, a
 * split window — the row scrolls instead. A fixed column width cannot do both.
 */
export const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${(props) => props.theme.column}, 1fr));
  gap: 1rem;
  align-items: start;

  @media (max-width: 52rem) {
    grid-auto-flow: column;
    grid-template-columns: none;
    grid-auto-columns: minmax(${(props) => props.theme.column}, 1fr);
    overflow-x: auto;
    padding-bottom: 0.75rem;
  }
`;

export const Missing = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: var(--wa-color-text-quiet);

  a {
    color: var(--wa-color-brand-fill-loud);
    text-decoration: none;
  }
`;

/**
 * What a board looks like before it has arrived: four columns of grey.
 *
 * A skeleton rather than a spinner, because the shape of what is coming is
 * known — and because the layout then does not jump when it lands.
 */
export const Skeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${(props) => props.theme.column}, 1fr));
  gap: 1rem;
  align-items: start;

  div {
    display: grid;
    gap: 0.55rem;
    padding: 0.85rem;
    background: var(--wa-color-surface-raised);
    border: 1px solid var(--wa-color-surface-border);
    border-radius: 12px;
  }

  span {
    height: 2.75rem;
    border-radius: 8px;
    background: linear-gradient(
      100deg,
      var(--wa-color-surface-default) 30%,
      var(--wa-color-surface-border) 50%,
      var(--wa-color-surface-default) 70%
    );
    background-size: 220% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }

  span:first-child {
    height: 1rem;
    width: 45%;
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
    span {
      animation: none;
    }
  }
`;
