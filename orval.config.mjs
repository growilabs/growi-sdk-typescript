export default {
  apiv1: {
    input: {
      target: 'https://docs.growi.org/openapi-spec-apiv1.json',
    },
    output: {
      mode: 'split',
      target: './src/generated/v1/',
      client: 'axios',
      prettier: false, // Disable because we're using Biome
      override: {
        mutator: {
          path: './src/api/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
  apiv3: {
    input: {
      target: 'https://docs.growi.org/openapi-spec-apiv3.json',
    },
    output: {
      mode: 'split',
      target: './src/generated/v3/',
      client: 'axios',
      prettier: false, // Disable because we're using Biome
      override: {
        mutator: {
          path: './src/api/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
};
