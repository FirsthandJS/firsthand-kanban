/** A lane's appearance. Structure is in `lane.tsx`. */
import { styled } from '@firsthandjs/styled';

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
