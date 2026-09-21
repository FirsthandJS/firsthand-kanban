/** The board title's appearance. Structure is in `title.tsx`. */
import { styled } from '@firsthandjs/styled';

/** The title and the pencil beside it, which appears on approach. */
export const Titles = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 100%;

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
  overflow-wrap: anywhere;
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
    max-width: 100%;
  }
`;
