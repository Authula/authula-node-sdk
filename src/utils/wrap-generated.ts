import type { AuthulaClient } from "../client";
import type { RequestContext } from "../mutators/custom-fetch";

function isHookKey(key: string): boolean {
  return key.startsWith("use") && key[3] === key[3]?.toUpperCase();
}

function wrapDataFn<T extends (...args: any[]) => any>(
  fn: T,
  ctx: RequestContext,
): T {
  return ((options?: Record<string, any>, ...rest: any[]) => {
    return fn({ ...ctx, ...options }, ...rest);
  }) as T;
}

function wrapHook<T extends (...args: any[]) => any>(
  fn: T,
  ctx: RequestContext,
): T {
  return ((options?: Record<string, any>, ...rest: any[]) => {
    return fn(
      {
        ...options,
        request: { ...ctx, ...options?.request },
      },
      ...rest,
    );
  }) as T;
}

export function wrapGenerated<T extends Record<string, any>>(
  mod: T,
  client: AuthulaClient,
): T {
  const context: RequestContext = {
    baseUrl: client.config.url,
    cookies: client.config.cookies,
    onBeforeFetch: (ctx) => client.runBeforeFetch(ctx),
    onAfterFetch: (ctx, res) => client.runAfterFetch(ctx, res),
  };

  const wrapped: Record<string, any> = {};
  for (const [key, value] of Object.entries(mod)) {
    if (typeof value === "function") {
      wrapped[key] = isHookKey(key)
        ? wrapHook(value, context)
        : wrapDataFn(value, context);
    } else {
      wrapped[key] = value;
    }
  }
  return wrapped as T;
}
