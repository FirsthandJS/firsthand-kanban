/** The board's appearance. Structure is in `board.tsx`. */
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

/** The title and the pencil beside it, which appears on approach. */
export const Titles = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;

  button[data-rename] {
    font: inherit;
    line-height: 1;
    padding: 0.25rem;
    color: var(--wa-color-text-quiet);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0;
    transition:
      opacity var(--motion) ease-out,
      color var(--motion) ease-out;
  }

  &:hover button[data-rename],
  button[data-rename]:focus-visible {
    opacity: 1;
  }
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  margin: 0;
  cursor: text;
`;

export const Rename = styled.form`
  input {
    font: inherit;
    font-size: 1.5rem;
    font-weight: 650;
    letter-spacing: -0.02em;
    color: inherit;
    background: transparent;
    border: 0;
    border-bottom: 2px solid var(--wa-color-brand-fill-loud);
    outline: none;
    padding: 0;
    min-width: 12rem;
  }
`;

export const Summary = styled.p`
  color: var(--wa-color-text-quiet);
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
`;

/** Says what the data layer is doing, because that is the thing to watch. */
export const Note = styled.p<{ $busy?: boolean }>`
  --note: ${(props) =>
    props.$busy === true ? 'var(--wa-color-brand-fill-loud)' : 'var(--wa-color-text-quiet)'};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--note);
  font-size: 0.8rem;
  margin: 0 0 0 auto;
  padding-top: 1.75rem;
  transition: color var(--motion) ease-out;

  &::before {
    content: '';
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: var(--note);
    transition: background var(--motion) ease-out;
  }
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

export const Column = styled.section<{ $over?: boolean }>`
  --edge: ${(props) =>
    props.$over === true
      ? 'color-mix(in oklab, var(--wa-color-brand-fill-loud) 70%, transparent)'
      : 'var(--wa-color-surface-border)'};
  --tint: ${(props) =>
    props.$over === true
      ? 'color-mix(in oklab, var(--wa-color-brand-fill-loud) 7%, var(--wa-color-surface-raised))'
      : 'var(--wa-color-surface-raised)'};
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.85rem;
  min-height: 7rem;
  background: var(--tint);
  border: 1px solid var(--edge);
  border-radius: 12px;
  transition:
    background var(--motion) ease-out,
    border-color var(--motion) ease-out;

  button[data-add] {
    font: inherit;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.5rem;
    color: var(--wa-color-text-quiet);
    background: transparent;
    border: 1px dashed transparent;
    border-radius: 8px;
    cursor: pointer;
    transition:
      color var(--motion) ease-out,
      border-color var(--motion) ease-out,
      background var(--motion) ease-out;
  }

  &:hover button[data-add],
  button[data-add]:focus-visible {
    color: var(--wa-color-text-normal);
    border-color: var(--wa-color-surface-border);
  }
`;

export const ColumnHead = styled.header`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0 0.15rem;
`;

export const Name = styled.h2`
  font-size: 0.78rem;
  font-weight: 650;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--wa-color-text-quiet);
  margin: 0 auto 0 0;
`;

export const Count = styled.span`
  font-variant-numeric: tabular-nums;
  font-size: 0.78rem;
  color: var(--wa-color-text-quiet);
  background: var(--wa-color-surface-default);
  border-radius: 999px;
  padding: 0.05rem 0.45rem;
`;

export const Slot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0.75rem;
`;

/** The composer, which is not there until it is asked for. */
export const Compose = styled.form`
  display: grid;
  gap: 0.5rem;
  padding: 0.6rem;
  background: var(--wa-color-surface-default);
  border: 1px solid var(--wa-color-surface-border);
  border-radius: 10px;
  transition:
    opacity var(--motion) ease-out,
    transform var(--motion) ease-out;

  input {
    font: inherit;
    font-size: 0.95rem;
    width: 100%;
    padding: 0.15rem 0;
    color: inherit;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--wa-color-surface-border);
    outline: none;
    transition: border-color var(--motion) ease-out;
  }

  input:focus {
    border-color: var(--wa-color-brand-fill-loud);
  }

  @starting-style {
    & {
      opacity: 0;
      transform: translateY(-4px);
    }
  }
`;

export const Kinds = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;

  span {
    flex: 1;
  }

  button {
    font: inherit;
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.25rem 0.5rem;
    color: var(--wa-color-text-quiet);
    background: transparent;
    border: 1px solid var(--wa-color-surface-border);
    border-radius: 999px;
    cursor: pointer;
    transition:
      color var(--motion) ease-out,
      border-color var(--motion) ease-out,
      background var(--motion) ease-out;
  }

  button[data-kind='FEATURE'][data-active='true'] {
    color: var(--wa-color-brand-fill-loud);
    border-color: color-mix(in oklab, var(--wa-color-brand-fill-loud) 65%, transparent);
  }

  button[data-kind='BUG'][data-active='true'] {
    color: var(--wa-color-danger-fill-loud);
    border-color: color-mix(in oklab, var(--wa-color-danger-fill-loud) 65%, transparent);
  }

  button[data-kind='CHORE'][data-active='true'] {
    color: var(--wa-color-text-normal);
    border-color: var(--wa-color-text-quiet);
  }

  button[data-quiet] {
    border-color: transparent;
    text-transform: none;
    letter-spacing: 0;
  }

  button[data-submit] {
    text-transform: none;
    letter-spacing: 0;
    color: var(--wa-color-brand-on-loud);
    background: var(--wa-color-brand-fill-loud);
    border-color: transparent;
  }

  button[data-submit]:disabled {
    opacity: 0.6;
    cursor: progress;
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
