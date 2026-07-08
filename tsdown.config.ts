import { defineConfig } from "tsdown";

export default defineConfig({
  exports: true,
  entry: ["./src/index.ts", "./src/plugins/**/index.ts"],
  format: ["esm"],
  platform: "neutral",
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  shims: true,
  treeshake: true,
  target: ["es2022"],
});
