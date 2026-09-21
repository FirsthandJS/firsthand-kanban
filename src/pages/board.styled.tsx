/** The board's appearance. Structure is in `board.tsx`. */
import { styled } from '@firsthandjs/styled';

export const Head = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

export const Back = styled.div`
  font-size: 0.85rem;
  margin-bottom: 0.35rem;

  a {
    color: var(--wa-color-text-quiet);
    text-decoration: none;
  }

  a:hover {
    color: var(--wa-color-text-normal);
  }
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem;
`;

export const Summary = styled.p`
  color: var(--wa-color-text-quiet);
  font-size: 0.9rem;
  margin: 0;
`;

/** Says what the data layer is doing, because that is the thing to watch. */
export const Note = styled.p<{ $busy?: boolean }>`
  --note: ${(props) =>
    props.$busy === true ? 'var(--wa-color-brand-fill-loud)' : 'var(--wa-color-text-quiet)'};
  color: var(--note);
  font-size: 0.8rem;
  margin: 0 0 0 auto;
  padding-top: 1.5rem;
`;

export const Board = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
`;

export const Column = styled.section`
  flex: 0 0 ${(props) => props.theme.column};
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.9rem;
  background: var(--wa-color-surface-raised);
  border: 1px solid var(--wa-color-surface-border);
  border-radius: 12px;
`;

export const ColumnHead = styled.header`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

export const Name = styled.h2`
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--wa-color-text-quiet);
  margin: 0 auto 0 0;
`;

export const Count = styled.span`
  font-variant-numeric: tabular-nums;
  font-size: 0.8rem;
  color: var(--wa-color-text-quiet);
`;

export const Slot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0.5rem;
`;

export const Compose = styled.form`
  display: grid;
  gap: 0.5rem;
`;

export const Kinds = styled.div`
  display: flex;
  gap: 0.3rem;

  button {
    font: inherit;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.25rem 0.5rem;
    color: var(--wa-color-text-quiet);
    background: transparent;
    border: 1px solid var(--wa-color-surface-border);
    border-radius: 999px;
    cursor: pointer;
  }

  button[data-active='true'] {
    color: var(--wa-color-text-normal);
    border-color: color-mix(in oklab, var(--wa-color-brand-fill-loud) 65%, transparent);
  }
`;

export const Missing = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: var(--wa-color-text-quiet);
`;
