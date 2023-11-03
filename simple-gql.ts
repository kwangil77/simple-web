import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: './schema/simple-gql.graphql',
  documents: ['./lib/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    './graphql/simple-gql.ts': {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-graphql-request"
      ]
    }
  }
}

export default config;
