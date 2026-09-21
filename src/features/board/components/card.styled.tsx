/** A card's appearance. Structure is in `card.tsx`. */
import { styled } from '@firsthandjs/styled';
import type { Kind } from '@/shared/ui/theme';

/**
 * The kind is a custom property rather than a class per kind: one rule, one
 * value that changes, and the browser restyles nothing else when it does.
 *
 * Every transition here is behind `prefers-reduced-motion`, which is set once
 * in `theme.ts` as `--motion`: a person who asked for less movement gets none,
 * and the rules do not have to know that.
 */
export const Tile = styled.article<{ $kind: Kind; $dragging?: boolean }>`
  --kind: ${(props) => props.theme.kinds[props.$kind]};
  /* Faded, not ghostly: at 0.35 the card you are holding was hard to read. */
  --lift: ${(props) => (props.$dragging === true ? '0.8' : '1')};
  --tilt: ${(props) => (props.$dragging === true ? '1.5deg' : '0deg')};
  position: relative;
  padding: 0.6rem 0.75rem 0.65rem;
  background: var(--wa-color-surface-default);
  border: 1px solid var(--wa-color-surface-border);
  border-left: 3px solid var(--kind);
  border-radius: 10px;
  opacity: var(--lift);
  cursor: grab;
  transition:
    transform var(--motion) ease-out,
    box-shadow var(--motion) ease-out,
    border-color var(--motion) ease-out,
    opacity var(--motion) ease-out;

  transform: rotate(var(--tilt));

  &:hover {
    transform: translateY(-1px) rotate(var(--tilt));
    border-color: color-mix(in oklab, var(--kind) 55%, var(--wa-color-surface-border));
    box-shadow: 0 10px 24px -18px rgb(0 0 0 / 0.9);
  }

  &:active {
    cursor: grabbing;
  }

  &:hover button,
  &:focus-within button {
    opacity: 1;
  }

  @starting-style {
    & {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
`;

export const Marker = styled.span`
  display: inline-block;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--kind);
  margin-bottom: 0.1rem;
`;

export const Title = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.35;
  cursor: text;
`;

/** The same box the title occupied, so editing does not move anything. */
export const Edit = styled.form`
  margin: 0;

  textarea {
    font: inherit;
    font-size: 0.95rem;
    line-height: 1.35;
    width: 100%;
    padding: 0;
    color: inherit;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--kind);
    outline: none;
    resize: none;
    overflow: hidden;
    display: block;
  }
`;

/**
 * The buttons, out of the flow.
 *
 * In the flow they reserved a row of height on every card whether or not
 * anybody was looking at them, which made a two-line card as tall as a
 * four-line one. Absolute, they cost nothing until they are wanted.
 */
export const Actions = styled.div`
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  display: flex;
  gap: 0.1rem;
  background: color-mix(in oklab, var(--wa-color-surface-default) 85%, transparent);
  backdrop-filter: blur(2px);
  border-radius: 8px;

  button {
    font: inherit;
    font-size: 0.8rem;
    line-height: 1;
    padding: 0.2rem 0.35rem;
    color: var(--wa-color-text-quiet);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0;
    transition:
      opacity var(--motion) ease-out,
      color var(--motion) ease-out,
      background var(--motion) ease-out;

    &:hover:not(:disabled) {
      color: var(--wa-color-text-normal);
      background: var(--wa-color-surface-raised);
    }

    &:focus-visible {
      opacity: 1;
      outline: 2px solid var(--kind);
      outline-offset: 1px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0;
    }
  }
`;
