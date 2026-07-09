import type { AuthulaClient } from "../client";

function isHookKey(key: string): boolean {
  return key.startsWith("use") && key[3] === key[3]?.toUpperCase();
}

export function wrapGenerated<T extends Record<string, any>>(
  mod: T,
  client: AuthulaClient,
): T {
  const baseUrl = client.config.url.replace(/\/+$/, "");
  const cookies = client.config.cookies;
  const onBeforeFetch = (ctx: any) => client.runBeforeFetch(ctx);
  const onAfterFetch = (ctx: any, res: Response) =>
    client.runAfterFetch(ctx, res);

  const wrapped: Record<string, any> = {};
  for (const [key, value] of Object.entries(mod)) {
    if (typeof value !== "function") {
      wrapped[key] = value;
      continue;
    }

    if (isHookKey(key)) {
      wrapped[key] = (options?: Record<string, any>, ...rest: any[]) =>
        value(
          { ...options, request: { ...options?.request, baseUrl, cookies, onBeforeFetch, onAfterFetch } },
          ...rest,
        );
    } else {
      wrapped[key] = (...args: any[]) => {
        const ctx = { baseUrl, cookies, onBeforeFetch, onAfterFetch };
        const optionsIdx = value.length - 1;
        while (args.length < optionsIdx) {
          args.push(undefined);
        }
        if (optionsIdx >= 0 && args.length === optionsIdx) {
          args.push(ctx);
        } else if (optionsIdx >= 0) {
          args[optionsIdx] = { ...args[optionsIdx], ...ctx };
        }
        return value(...args);
      };
    }
  }
  return wrapped as T;
}
