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

/** What stands where the form will be, until somebody asks for the form. */
export const New = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font: inherit;
  font-size: 0.9rem;
  line-height: 1;
  padding: 0.55rem 0.8rem;
  color: var(--wa-color-brand-on-loud);
  background: var(--wa-color-brand-fill-loud);
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition:
    filter var(--motion) ease-out,
    transform var(--motion) ease-out;

  &:hover {
    filter: brightness(1.08);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid var(--wa-color-brand-fill-loud);
    outline-offset: 2px;
  }
`;

export const Create = styled.form`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.35rem 0.3rem 0.7rem;
  background: var(--wa-color-surface-raised);
  border: 1px solid var(--wa-color-surface-border);
  border-radius: 10px;
  transition:
    opacity var(--motion) ease-out,
    transform var(--motion) ease-out;

  input {
    font: inherit;
    font-size: 0.9rem;
    width: 12rem;
    padding: 0.3rem 0;
    color: inherit;
    background: transparent;
    border: 0;
    outline: none;
  }

  button {
    font: inherit;
    font-size: 0.85rem;
    line-height: 1;
    padding: 0.45rem 0.7rem;
    border-radius: 7px;
    cursor: pointer;
    border: 1px solid transparent;
    transition:
      color var(--motion) ease-out,
      background var(--motion) ease-out;
  }

  button[data-quiet] {
    color: var(--wa-color-text-quiet);
    background: transparent;
  }

  button[data-quiet]:hover {
    color: var(--wa-color-text-normal);
  }

  button[data-submit] {
    color: var(--wa-color-brand-on-loud);
    background: var(--wa-color-brand-fill-loud);
  }

  button[data-submit]:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  @starting-style {
    & {
      opacity: 0;
      transform: translateY(-4px);
    }
  }
`;

export const Grid = styled.div<{ $stale?: boolean }>`
  --tile-opacity: ${(props) => (props.$stale === true ? '0.55' : '1')};
  opacity: var(--tile-opacity);
  transition: opacity var(--motion) ease-out;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1rem;
`;

export const Tile = styled.article`
  position: relative;
  height: 100%;
  padding: 1.05rem 1.15rem;
  background: var(--wa-color-surface-raised);
  border: 1px solid var(--wa-color-surface-border);
  border-radius: 12px;
  cursor: pointer;
  transition:
    border-color var(--motion) ease-out,
    transform var(--motion) ease-out,
    box-shadow var(--motion) ease-out;

  &:hover {
    border-color: color-mix(in oklab, var(--wa-color-brand-fill-loud) 55%, transparent);
    transform: translateY(-2px);
    box-shadow: 0 16px 30px -26px rgb(0 0 0 / 0.9);
  }

  &:focus-visible {
    outline: 2px solid var(--wa-color-brand-fill-loud);
    outline-offset: 2px;
  }

  &:hover button,
  &:focus-within button {
    opacity: 1;
  }

  @starting-style {
    & {
      opacity: 0;
      transform: translateY(6px);
    }
  }
`;

export const Name = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 1.02rem;
  margin: 0 0 0.3rem;

  button {
    font: inherit;
    line-height: 1;
    padding: 0.2rem;
    color: var(--wa-color-text-quiet);
    background: transparent;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0;
    transition:
      opacity var(--motion) ease-out,
      color var(--motion) ease-out;
  }

  button:hover {
    color: var(--wa-color-text-normal);
  }
`;

export const Rename = styled.form`
  margin: 0 0 0.3rem;

  input {
    font: inherit;
    font-size: 1.02rem;
    font-weight: 650;
    width: 100%;
    padding: 0;
    color: inherit;
    background: transparent;
    border: 0;
    border-bottom: 2px solid var(--wa-color-brand-fill-loud);
    outline: none;
  }
`;

export const Summary = styled.p`
  color: var(--wa-color-text-quiet);
  font-size: 0.88rem;
  line-height: 1.45;
  margin: 0 0 0.9rem;
`;

export const Count = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--wa-color-text-quiet);
  font-size: 0.85rem;

  span {
    font-variant-numeric: tabular-nums;
    color: var(--wa-color-text-normal);
    background: var(--wa-color-surface-default);
    border-radius: 999px;
    padding: 0.05rem 0.45rem;
  }
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
