import { AuthulaClient } from "./client";
import type { AuthulaClientOptions, Plugin } from "./types";

// Helper to extract plugin methods
export type InferPluginMethods<P> = P extends { init: (client: any) => infer M }
  ? M
  : never;

export type ClientWithPlugins<T extends readonly Plugin[]> = AuthulaClient & {
  [P in T[number] as P["id"]]: InferPluginMethods<P>;
};

export function createClient<const T extends readonly Plugin[]>(
  options: Omit<AuthulaClientOptions, "plugins"> & { plugins: T },
): ClientWithPlugins<T> {
  return new AuthulaClient(options as any) as ClientWithPlugins<T>;
}
