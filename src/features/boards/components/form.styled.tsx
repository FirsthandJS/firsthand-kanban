/** The new-board form's appearance. Structure is in `form.tsx`. */
import { styled } from '@firsthandjs/styled';

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
