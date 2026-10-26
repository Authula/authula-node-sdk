import { attachFrameworkHooks, type ClientWithPluginHooks } from "../core/framework-client";
import { createClient as createBaseClient } from "../core/sdk";
import type { AuthulaClientOptions, Plugin } from "../core/types";
import * as generated from "../gen/vue";

export * from "../core";
export * from "../gen/vue";

export function createClient<const T extends readonly Plugin[]>(
  options: Omit<AuthulaClientOptions, "plugins"> & { plugins: T },
): ClientWithPluginHooks<T, typeof generated, "use"> {
  const client = createBaseClient(options);
  return attachFrameworkHooks(client, options.plugins, generated, "use");
}
