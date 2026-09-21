import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Types for every `.gql` file, from the schema.
 *
 * Two outputs, and the second is what makes the first reachable:
 *
 *  1. `graphql-types.ts` — the operations' result and variable types, from
 *     the standard `typescript-operations` plugin.
 *  2. `graphql-modules.d.ts` — `@firsthandjs/data/codegen` writes one
 *     `declare module` per operation, so importing a `.gql` file gives a
 *     document that already knows both.
 *
 * With both, no call site carries a type argument and nothing can drift: the
 * variables are checked against the operation, and `data` is the shape the
 * server returns.
 */
const config: CodegenConfig = {
  schema: 'server/schema.graphql',
  documents: 'src/gql/**/*.gql',
  generates: {
    'src/graphql-types.ts': {
      plugins: ['typescript-operations'],
      config: { useTypeImports: true, skipTypename: true },
    },
    'src/graphql-modules.d.ts': {
      plugins: ['@firsthandjs/data/codegen'],
      config: { typesPath: './graphql-types' },
    },
  },
};

export default config;
