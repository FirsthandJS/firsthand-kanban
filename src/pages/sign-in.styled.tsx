/** The sign-in card's appearance. Structure is in `sign-in.tsx`. */
import { styled } from '@firsthandjs/styled';

export const Card = styled.section`
  max-width: 26rem;
  margin: 3rem auto 0;
  padding: 2rem;
  background: var(--wa-color-surface-raised);
  border: 1px solid var(--wa-color-surface-border);
  border-radius: 14px;
  /* The one flourish: a hairline of brand colour along the top edge. */
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--wa-color-brand-fill-loud) 45%, transparent),
    0 18px 40px -28px rgb(0 0 0 / 0.8);
`;

export const Title = styled.h1`
  font-size: 1.4rem;
  letter-spacing: -0.02em;
  margin: 0 0 0.4rem;
`;

export const Intro = styled.p`
  color: var(--wa-color-text-quiet);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1.5rem;
`;

export const Fields = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

export const Field = styled.div`
  display: block;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.25rem;
`;

export const Switcher = styled.button`
  font: inherit;
  font-size: 0.9rem;
  color: var(--wa-color-text-quiet);
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: var(--wa-color-text-normal);
  }
`;
