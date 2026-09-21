/** A card's appearance. Structure is in `card.tsx`. */
import { styled } from '@firsthandjs/styled';
import type { Kind } from '../setup/theme';

/**
 * The kind is a custom property rather than a class per kind: one rule, one
 * value that changes, and the browser does not restyle a thing when it does.
 */
export const Tile = styled.article<{ $kind: Kind }>`
  --kind: ${(props) => props.theme.kinds[props.$kind]};
  position: relative;
  padding: 0.7rem 0.8rem 0.6rem;
  background: var(--wa-color-surface-default);
  border: 1px solid var(--wa-color-surface-border);
  border-left: 3px solid var(--kind);
  border-radius: 8px;

  &:hover button {
    opacity: 1;
  }
`;

export const Marker = styled.span`
  display: inline-block;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--kind);
  margin-bottom: 0.15rem;
`;

export const Title = styled.p`
  margin: 0 0 0.35rem;
  font-size: 0.95rem;
  line-height: 1.35;
`;

export const Actions = styled.div`
  display: flex;
  gap: 0.15rem;

  button {
    font: inherit;
    font-size: 0.85rem;
    line-height: 1;
    padding: 0.2rem 0.4rem;
    color: var(--wa-color-text-quiet);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0.35;
    transition: opacity 120ms ease-out;

    &:hover:not(:disabled) {
      color: var(--wa-color-text-normal);
      border-color: var(--wa-color-surface-border);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.15;
    }
  }
`;
