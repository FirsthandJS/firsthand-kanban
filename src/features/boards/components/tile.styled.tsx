/** A board tile's appearance. Structure is in `tile.tsx`. */
import { styled } from '@firsthandjs/styled';

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

  button[data-delete]:hover {
    color: var(--wa-color-danger-fill-loud);
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

/** The one question this page asks, in the space the summary occupied. */
export const Confirm = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  margin: 0 0 0.9rem;
  min-height: 2.55rem;

  span {
    color: var(--wa-color-text-normal);
    margin-right: auto;
  }

  button {
    font: inherit;
    font-size: 0.8rem;
    line-height: 1;
    padding: 0.35rem 0.6rem;
    border-radius: 7px;
    border: 1px solid transparent;
    cursor: pointer;
    opacity: 1 !important;
    transition: background var(--motion) ease-out;
  }

  button[data-quiet] {
    color: var(--wa-color-text-quiet);
    background: transparent;
    border-color: var(--wa-color-surface-border);
  }

  button[data-danger] {
    color: var(--wa-color-danger-on-loud);
    background: var(--wa-color-danger-fill-loud);
  }

  button[data-danger]:disabled {
    cursor: progress;
    opacity: 0.6 !important;
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
