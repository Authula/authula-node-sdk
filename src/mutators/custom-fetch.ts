import { parseSetCookie } from "cookie";
import { toSnakeCaseKeys } from "es-toolkit";

import type { FetchContext, CookieStore } from "../types";

export class ApiError extends Error {
  status: number;
  data: any;
  headers: Headers;

  constructor(message: string, status: number, data: any, headers: Headers) {
    super(message || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.headers = headers;
  }
}

export interface RequestContext {
  baseUrl?: string;
  cookies?: () => CookieStore | Promise<CookieStore>;
  onBeforeFetch?: (ctx: FetchContext) => Promise<void>;
  onAfterFetch?: (ctx: FetchContext, res: Response) => Promise<"retry" | void>;
}

async function resolveCookieContext(
  cookiesFn?: () => CookieStore | Promise<CookieStore>,
): Promise<{ header: string | null; store: CookieStore | null }> {
  if (cookiesFn) {
    try {
      const store = await cookiesFn();
      const all = store.getAll();
      if (all.length === 0) {
        return { header: null, store };
      }
      return {
        header: all.map((c) => `${c.name}=${c.value}`).join("; "),
        store,
      };
    } catch {
      return { header: null, store: null };
    }
  }

  return { header: null, store: null };
}

const KNOWN_COOKIE_ATTRS = new Set([
  "path",
  "domain",
  "expires",
  "maxAge",
  "httpOnly",
  "secure",
  "sameSite",
]);

function applyResponseCookies(res: Response, store: CookieStore | null): void {
  const values: string[] = [];

  if (typeof res.headers.getSetCookie === "function") {
    values.push(...res.headers.getSetCookie());
  } else {
    const single = res.headers.get("set-cookie");
    if (single) {
      values.push(...single.split(", "));
    }
  }

  if (values.length === 0) {
    return;
  }

  if (!store) {
    return;
  }

  for (const raw of values) {
    let parsed: ReturnType<typeof parseSetCookie>;
    try {
      parsed = parseSetCookie(raw);
    } catch {
      continue;
    }
    if (!parsed) {
      continue;
    }

    const { name, value, ...attrs } = parsed as Record<string, any>;
    const normalized: Record<string, any> = {};
    for (const [k, v] of Object.entries(attrs)) {
      const lower = k.toLowerCase();
      if (KNOWN_COOKIE_ATTRS.has(k)) {
        normalized[k] = v;
      } else if (lower === "maxage") normalized["maxAge"] = v;
      else if (lower === "httponly") normalized["httpOnly"] = v;
      else if (lower === "samesite") normalized["sameSite"] = v;
    }

    try {
      store.set(name, value, normalized);
    } catch {
      // Safe catch if store is immutable during SSR rendering phase
    }
  }
}

function prependBase(url: string, base: string): string {
  if (!base) {
    return url;
  }
  if (/^https?:\/\//.test(url)) {
    return url.replace(/^https?:\/\/[^/]+/, base);
  }
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

function convertRequestBodyToSnakeCase(
  body: BodyInit | null | undefined,
): BodyInit | null | undefined {
  if (typeof body !== "string") {
    return body;
  }
  try {
    const parsed = JSON.parse(body);
    return parsed !== null && typeof parsed === "object"
      ? JSON.stringify(toSnakeCaseKeys(parsed))
      : body;
  } catch {
    return body;
  }
}

async function parseJsonBody(res: Response): Promise<any> {
  if ([204, 205, 304].includes(res.status)) {
    return null;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function pickContextOptions(options?: Record<string, any>): {
  baseUrl?: string;
  cookies?: () => CookieStore | Promise<CookieStore>;
  onBeforeFetch?: (ctx: FetchContext) => Promise<void>;
  onAfterFetch?: (ctx: FetchContext, res: Response) => Promise<"retry" | void>;
} {
  if (!options) return {};
  return {
    baseUrl: options.baseUrl,
    cookies: options.cookies,
    onBeforeFetch: options.onBeforeFetch,
    onAfterFetch: options.onAfterFetch,
  };
}

export async function customFetch<T>(
  url: string,
  options?: RequestInit & {
    method?: string;
    baseUrl?: string;
    cookies?: () => CookieStore | Promise<CookieStore>;
    onBeforeFetch?: (ctx: FetchContext) => Promise<void>;
    onAfterFetch?: (
      ctx: FetchContext,
      res: Response,
    ) => Promise<"retry" | void>;
  },
): Promise<T> {
  const { baseUrl, cookies, onBeforeFetch, onAfterFetch } =
    pickContextOptions(options);
  const resolvedUrl = prependBase(url, baseUrl ?? "");
  const cookieCtx = await resolveCookieContext(cookies);

  const headers = new Headers(options?.headers || {});
  if (cookieCtx.header && !headers.has("cookie")) {
    headers.set("cookie", cookieCtx.header);
  }

  const ctx: FetchContext = {
    url: resolvedUrl,
    init: {
      method: options?.method ?? "GET",
      headers,
      body: convertRequestBodyToSnakeCase(options?.body),
      credentials: "include",
      signal: options?.signal ?? null,
    },
    meta: {},
  };

  if (onBeforeFetch) {
    await onBeforeFetch(ctx);
  }

  let res = await fetch(ctx.url, ctx.init);

  if (onAfterFetch) {
    const action = await onAfterFetch(ctx, res);
    if (action === "retry" && !ctx.meta.retry) {
      ctx.meta.retry = true;
      res = await fetch(ctx.url, ctx.init);
    }
  }

  applyResponseCookies(res, cookieCtx.store);

  const data = await parseJsonBody(res);

  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(data.message)
        : "";
    throw new ApiError(message, res.status, data, res.headers);
  }

  return data as T;
}
