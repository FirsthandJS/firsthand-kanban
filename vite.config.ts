/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { firsthand } from '@firsthandjs/compiler/vite';
import { graphql } from '@firsthandjs/data/vite';
import { graphqlServer } from './server/index';

export default defineConfig({
  plugins: [
    // TSX into DOM instructions, before anything else sees it.
    firsthand({ packageName: 'firsthand-kanban' }),
    // `.gql` files into parsed documents at build time: fragments inlined,
    // cache tags read from the directives, the directives stripped before
    // anything is sent, and the parser never shipped.
    graphql(),
    // The server, in the same process as the dev server and the preview.
    graphqlServer(),
  ],
  // The same `@/` the tsconfig declares, so the editor and the bundler agree.
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'happy-dom' },
});
