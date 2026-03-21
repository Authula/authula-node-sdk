import type { CookieProvider } from "./cookies";
import type { Plugin } from "./plugins";

export type FetchOptions = {
  /**
   * The abort timeout in seconds
   */
  abortTimeout?: number;
};

export type AuthulaClientConfig = {
  /**
   * The URL of your Authula server
   * @example 'http://localhost:8080/auth'
   */
  url: string;
  fetchOptions?: FetchOptions;
  cookies?: CookieProvider;
};

export type AuthulaClientOptions = AuthulaClientConfig & {
  /**
   * The list of plugins to use
   */
  plugins: Array<Plugin>;
};
