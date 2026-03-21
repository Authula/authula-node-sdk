import { toCamelCaseKeys, toSnakeCaseKeys } from "es-toolkit";

import type { AuthulaClient } from "./client";
import type { CookieStore, FetchContext, FetchRequestOptions } from "./types";

export async function wrappedFetch<T>(
  client: AuthulaClient,
  endpoint: string,
  options: FetchRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers || {});

  let cookieStore: CookieStore | null = null;

  if (client.config.cookies) {
    cookieStore = await client.config.cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    if (cookieHeader) {
      headers.set("cookie", cookieHeader);
    }
  }

  const controller = new AbortController();
  const abortTimeout = client.config.fetchOptions?.abortTimeout;

  if (abortTimeout) {
    setTimeout(() => controller.abort(), abortTimeout * 1000);
  }

  const ctx: FetchContext = {
    url: `${client.config.url}${endpoint}`,
    init: {
      method: options.method ?? "GET",
      headers,
      body: options.body
        ? JSON.stringify(toSnakeCaseKeys(options.body))
        : undefined,
      credentials: "include",
      signal: controller.signal,
    },
    meta: {},
  };

  await client.runBeforeFetch(ctx);

  let res = await fetch(ctx.url, ctx.init);

  const action = await client.runAfterFetch(ctx, res);
  if (action === "retry" && !ctx.meta.retry) {
    ctx.meta.retry = true;
    res = await fetch(ctx.url, ctx.init);
  }

  const setCookieHeaders =
    res.headers.getSetCookie?.() ??
    res.headers.get("set-cookie")?.split(", ") ??
    null;

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const resData = await res.json();

  // Apply Set-Cookie back into Next.js store (SSR only)
  if (cookieStore && setCookieHeaders) {
    for (const raw of setCookieHeaders) {
      const [pair, ...attrs] = raw.split(";");
      const [name, value] = pair.split("=");

      if (!name || !value) continue;

      const options: Record<string, any> = {};

      for (const attr of attrs) {
        const [k, v] = attr.trim().split("=");

        switch (k.toLowerCase()) {
          case "path":
            options.path = v;
            break;
          case "expires":
            options.expires = new Date(v);
            break;
          case "max-age":
            options.maxAge = Number(v);
            break;
          case "httponly":
            options.httpOnly = true;
            break;
          case "secure":
            options.secure = true;
            break;
          case "samesite":
            options.sameSite = v?.toLowerCase();
            break;
        }
      }

      cookieStore.set(name.trim(), decodeURIComponent(value.trim()), options);
    }
  }

  return toCamelCaseKeys(resData) as T;
}
