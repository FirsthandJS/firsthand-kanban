/** The board list's appearance. Structure is in `boards.tsx`. */
import { styled } from '@firsthandjs/styled';

export const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  margin: 0 auto 0 0;
`;

export const Create = styled.form`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Grid = styled.div<{ $stale?: boolean }>`
  --tile-opacity: ${(props) => (props.$stale === true ? '0.55' : '1')};
  opacity: var(--tile-opacity);
  transition: opacity 120ms ease-out;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1rem;

  a {
    text-decoration: none;
    color: inherit;
  }
`;

export const Tile = styled.article`
  height: 100%;
  padding: 1.1rem 1.2rem;
  background: var(--wa-color-surface-raised);
  border: 1px solid var(--wa-color-surface-border);
  border-radius: 12px;
  transition:
    border-color 120ms ease-out,
    transform 120ms ease-out;

  &:hover {
    border-color: color-mix(in oklab, var(--wa-color-brand-fill-loud) 55%, transparent);
    transform: translateY(-2px);
  }
`;

export const Name = styled.h2`
  font-size: 1.05rem;
  margin: 0 0 0.3rem;
`;

export const Summary = styled.p`
  color: var(--wa-color-text-quiet);
  font-size: 0.9rem;
  line-height: 1.45;
  margin: 0 0 0.9rem;
`;

export const Count = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--wa-color-text-quiet);
  font-size: 0.85rem;
`;

export const Blank = styled.div`
  grid-column: 1 / -1;
  padding: 2.5rem 1.25rem;
  text-align: center;
  color: var(--wa-color-text-quiet);
  border: 1px dashed var(--wa-color-surface-border);
  border-radius: 12px;
`;

export const Cards = styled.strong`
  display: block;
  color: var(--wa-color-text-normal);
  margin-bottom: 0.35rem;
`;
