/** The composer's appearance. Structure is in `composer.tsx`. */
import { styled } from '@firsthandjs/styled';

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

/**
 * The kinds on one row, the buttons on the next.
 *
 * All five on one row overflowed a column the moment the column was narrow,
 * which is most of the time — a column is 15.5rem and five controls are not.
 */
export const Kinds = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 0.3rem;

  span[data-kinds] {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
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
