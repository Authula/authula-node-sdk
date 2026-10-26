import { readFile, writeFile } from "node:fs/promises";

import { defineConfig } from "tsdown";

const SOLID_QUERY_DTS = "./dist/solid.d.ts";

/**
 * Orval's Solid query-option helpers reference `QueryFunction` in their inferred
 * return types. The declaration bundler keeps the reference but drops the import,
 * so add it back to the existing `@tanstack/solid-query` import.
 */
async function patchSolidQueryFunctionImport(): Promise<void> {
  let dts: string;
  try {
    dts = await readFile(SOLID_QUERY_DTS, "utf8");
  } catch {
    return;
  }

  if (!/\bQueryFunction</.test(dts)) {
    return;
  }

  const importPattern = /import \{[^}]*\} from "@tanstack\/solid-query";/;
  const match = dts.match(importPattern);
  if (!match || /\bQueryFunction\b/.test(match[0])) {
    return;
  }

  const patched = match[0].replace("import {", "import { QueryFunction,");
  await writeFile(SOLID_QUERY_DTS, dts.replace(match[0], patched));
}

export default defineConfig({
  exports: true,
  entry: {
    core: "./src/core/index.ts",
    models: "./src/models/index.ts",
    plugins: "./src/plugins/index.ts",
    zod: "./src/zod/index.ts",
    react: "./src/react/index.ts",
    vue: "./src/vue/index.ts",
    solid: "./src/solid/index.ts",
    svelte: "./src/svelte/index.ts",
  },
  format: ["esm"],
  platform: "neutral",
  dts: {
    // Required so TypeScript can name the TanStack types inferred by Orval's
    // generated Solid query-option helpers under pnpm's nested node_modules.
    compilerOptions: {
      preserveSymlinks: true,
    },
  },
  clean: true,
  sourcemap: true,
  minify: false,
  shims: true,
  treeshake: true,
  target: ["es2022"],
  hooks: {
    "build:done": patchSolidQueryFunctionImport,
  },
});
