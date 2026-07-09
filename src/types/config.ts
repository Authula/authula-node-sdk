import type { Plugin } from "./plugins";

export type FetchOptions = {
  /**
   * Additional headers to include in every request made by the client
   */
  headers?: Record<string, string>;
  /**
   * The abort timeout in seconds
   */
  abortTimeout?: number;
};

export type CookieAttributes = {
  path?: string;
  domain?: string;
  expires?: Date;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
};

export interface CookieStore {
  getAll(): { name: string; value: string }[];
  set(name: string, value: string, options?: CookieAttributes): void;
}

export type AuthulaClientConfig = {
  /**
   * The URL of your Authula server
   * @example 'http://localhost:8080/api/auth'
   */
  url: string;
  fetchOptions?: FetchOptions;
  /**
   * Optional cookie store for SSR environments.
   * In the browser, cookies are handled automatically via document.cookie.
   * In SSR (Next.js, Tanstack Start, etc.), provide a function that returns a CookieStore
   * compatible with the framework's cookies API.
   *
   * @example Next.js
   * cookies: () => import('next/headers').then(m => m.cookies())
   */
  cookies?: () => CookieStore | Promise<CookieStore>;
};

export type AuthulaClientOptions = AuthulaClientConfig & {
  /**
   * The list of plugins to use
   */
  plugins: Array<Plugin>;
};
