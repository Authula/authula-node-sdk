import { parseSetCookie } from "cookie";
import { toCamelCaseKeys, toSnakeCaseKeys } from "es-toolkit";

import type { FetchContext, CookieStore } from "../types";
import { getDefaultClient } from "../runtime";

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

const KNOWN_COOKIE_ATTRS = new Set([
  "path",
  "domain",
  "expires",
  "maxAge",
  "httpOnly",
  "secure",
  "sameSite",
]);

function parseSetCookieToStore(raw: string, store: CookieStore): void {
  let parsed: Record<string, any>;
  try {
    parsed = parseSetCookie(raw) as Record<string, any>;
  } catch {
    return;
  }
  if (!parsed) {
    return;
  }

  const { name, value, ...attrs } = parsed;
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
    // store may be immutable during SSR render
  }
}

export function convertQueryKeysToSnakeCase(url: string): string {
  const qIndex = url.indexOf("?");
  if (qIndex === -1) {
    return url;
  }

  const base = url.slice(0, qIndex);
  const searchParams = new URLSearchParams(url.slice(qIndex + 1));
  const snakeParams = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    snakeParams.append(snakeKey, value);
  }

  return `${base}?${snakeParams.toString()}`;
}

export async function customFetch<T>(
  url: string,
  options?: RequestInit & {
    method?: string;
    baseUrl?: string;
    cookies?: () => CookieStore | Promise<CookieStore>;
    onBeforeFetch?: (ctx: FetchContext) => Promise<void>;
    onAfterFetch?: (ctx: FetchContext, res: Response) => Promise<"retry" | void>;
  },
): Promise<T> {
  const client = options?.baseUrl === undefined ? getDefaultClient() : undefined;
  const baseUrl = options?.baseUrl ?? client?.config.url.replace(/\/+$/, "") ?? "";
  const cookies = options?.cookies ?? client?.config.cookies;
  const onBeforeFetch =
    options?.onBeforeFetch ?? (client ? client.runBeforeFetch.bind(client) : undefined);
  const onAfterFetch =
    options?.onAfterFetch ?? (client ? client.runAfterFetch.bind(client) : undefined);

  if (!baseUrl && !/^https?:\/\//.test(url)) {
    throw new Error(
      "No Authula client configured. Call createClient() before using Authula hooks, or pass a baseUrl request option.",
    );
  }

  const resolvedUrl = convertQueryKeysToSnakeCase(prependBase(url, baseUrl));

  const headers = new Headers(options?.headers || {});

  let cookieStore: CookieStore | null = null;
  let resolvedCookies: Record<string, string> | undefined;
  if (cookies) {
    try {
      cookieStore = await cookies();
      const all = cookieStore.getAll();
      if (all.length > 0 && !headers.has("cookie")) {
        headers.set("cookie", all.map((c) => `${c.name}=${c.value}`).join("; "));
      }
      resolvedCookies = {};
      for (const c of all) {
        resolvedCookies[c.name] = c.value;
      }
    } catch {
      cookieStore = null;
    }
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
    cookies: resolvedCookies,
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

  if (cookieStore) {
    const values: string[] =
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : (res.headers.get("set-cookie")?.split(", ") ?? []);
    for (const raw of values) {
      parseSetCookieToStore(raw, cookieStore);
    }
  }

  const data = await parseJsonBody(res);

  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data ? String(data.message) : "";
    throw new ApiError(message, res.status, data, res.headers);
  }

  return toCamelCaseKeys(data) as T;
}
