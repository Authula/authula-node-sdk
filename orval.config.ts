import { defineConfig } from "orval";

import { openApiTransformer } from "./orval-utils";

const input = {
  target: "./openapi.json",
  override: {
    transformer: openApiTransformer,
  },
};

const baseOutput = {
  mode: "tags-split",
  namingConvention: "kebab-case",
  headers: false,
  urlEncodeParameters: false,
  formatter: "oxfmt",
  tsconfig: "./tsconfig.json",
  packageJson: "./package.json",
  override: {
    enumGenerationType: "const",
    namingConvention: {
      enum: "camelCase",
    },
    useTypeOverInterfaces: true,
    mutator: {
      path: "./src/core/mutators/custom-fetch.ts",
      name: "customFetch",
    },
  },
} as const;

type QueryClient = "react-query" | "vue-query" | "solid-query" | "svelte-query";

const queryProject = (client: QueryClient, dir: string) => ({
  input,
  output: {
    ...baseOutput,
    client,
    target: `./src/gen/${dir}`,
    schemas: "./src/models",
    mock: false,
  },
});

export default defineConfig({
  fetch: {
    input,
    output: {
      ...baseOutput,
      client: "fetch",
      target: "./src/gen/endpoints",
      schemas: "./src/models",
      mock: true,
      override: {
        ...baseOutput.override,
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
  react: queryProject("react-query", "react"),
  vue: queryProject("vue-query", "vue"),
  solid: queryProject("solid-query", "solid"),
  svelte: queryProject("svelte-query", "svelte"),
  zod: {
    input,
    output: {
      mode: "tags-split",
      namingConvention: "kebab-case",
      target: "./src/gen/zod",
      client: "zod",
      fileExtension: ".zod.ts",
      allParamsOptional: false,
      packageJson: "./package.json",
      formatter: "oxfmt",
      tsconfig: "./tsconfig.json",
      override: {
        enumGenerationType: "union",
        zod: {
          generateReusableSchemas: true,
        },
        namingConvention: {
          enum: "camelCase",
        },
        useTypeOverInterfaces: true,
      },
    },
  },
});
