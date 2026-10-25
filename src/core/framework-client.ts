import type { AuthulaClient } from "./client";
import type { InferPluginMethods } from "./sdk";
import type { Plugin } from "./types";

export type HookPrefix = "use" | "create";

type HookName<Prefix extends HookPrefix, Method extends PropertyKey> = Method extends string
  ? `${Prefix}${Capitalize<Method>}`
  : never;

type PluginHooks<P extends Plugin, G extends object, Prefix extends HookPrefix> = {
  [K in keyof G as K extends HookName<Prefix, keyof InferPluginMethods<P>> ? K : never]: G[K];
};

type WithFrameworkApi<P extends Plugin, G extends object, Prefix extends HookPrefix> = [
  InferPluginMethods<P>,
] extends [void]
  ? InferPluginMethods<P>
  : InferPluginMethods<P> & PluginHooks<P, G, Prefix>;

export type ClientWithPluginHooks<
  T extends readonly Plugin[],
  G extends object,
  Prefix extends HookPrefix,
> = AuthulaClient & {
  [P in T[number] as P["id"]]: WithFrameworkApi<P, G, Prefix>;
};

type AnyFunction = (...args: any[]) => any;

function hookName(prefix: HookPrefix, method: string): string {
  return `${prefix}${method.charAt(0).toUpperCase()}${method.slice(1)}`;
}

function createRequestContext(client: AuthulaClient) {
  return {
    baseUrl: client.config.url.replace(/\/+$/, ""),
    cookies: client.config.cookies,
    onBeforeFetch: (ctx: any) => client.runBeforeFetch(ctx),
    onAfterFetch: (ctx: any, res: Response) => client.runAfterFetch(ctx, res),
  };
}

export function wrapHook(hook: AnyFunction, client: AuthulaClient): AnyFunction {
  const requestContext = createRequestContext(client);

  return (...args: any[]) => {
    let optionsIdx = Math.max(0, hook.length - 2);
    if (args[optionsIdx] != null && typeof args[optionsIdx] !== "object") {
      optionsIdx = Math.max(0, hook.length - 1);
    }
    while (args.length <= optionsIdx) {
      args.push(undefined);
    }

    const existing = args[optionsIdx];
    const existingOptions = typeof existing === "object" && existing !== null ? existing : {};
    const existingRequest = (existingOptions as { request?: object }).request;

    args[optionsIdx] = {
      ...existingOptions,
      // Explicit per-call values win over the client defaults, so SSR callers
      // can override cookies/baseUrl for a single request.
      request: { ...requestContext, ...existingRequest },
    };

    return hook(...args);
  };
}

export function attachFrameworkHooks<
  T extends readonly Plugin[],
  G extends object,
  Prefix extends HookPrefix,
>(
  client: AuthulaClient,
  plugins: T,
  generated: G,
  prefix: Prefix,
): ClientWithPluginHooks<T, G, Prefix> {
  const generatedHooks = generated as Record<string, unknown>;
  const pluginApis = client as unknown as Record<string, unknown>;

  for (const plugin of plugins) {
    const api = pluginApis[plugin.id];
    if (!api || typeof api !== "object") {
      continue;
    }

    const pluginApi = api as Record<string, unknown>;
    for (const [method, value] of Object.entries(pluginApi)) {
      if (typeof value !== "function") {
        continue;
      }

      const name = hookName(prefix, method);
      const hook = generatedHooks[name];
      if (typeof hook === "function") {
        pluginApi[name] = wrapHook(hook as AnyFunction, client);
      }
    }
  }

  return client as ClientWithPluginHooks<T, G, Prefix>;
}
