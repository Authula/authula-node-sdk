import { toSnakeCaseKeys } from "es-toolkit";

import { wrappedFetch } from "./fetch";
import type {
  FetchContext,
  AuthulaClientConfig,
  AuthulaClientOptions,
  SignOutRequest,
  SignOutResponse,
  Plugin,
  BeforeFetchHook,
  AfterFetchHook,
} from "./types";

export class AuthulaClient {
  public readonly config: AuthulaClientConfig;
  private readonly plugins: Array<Plugin>;
  private readonly beforeFetchHooks: BeforeFetchHook[] = [];
  private readonly afterFetchHooks: AfterFetchHook[] = [];

  constructor(options: AuthulaClientOptions) {
    this.plugins = options.plugins;

    const { plugins, ...rest } = options;
    this.config = rest;

    for (const plugin of this.plugins) {
      if ("attachCookies" in plugin && this.config.cookies) {
        (plugin as any).attachCookies(this.config.cookies);
      }
      (this as any)[plugin.id] = plugin.init(this);
    }
  }

  public registerBeforeFetch(hook: BeforeFetchHook): void {
    this.beforeFetchHooks.push(hook);
  }

  public registerAfterFetch(hook: AfterFetchHook): void {
    this.afterFetchHooks.push(hook);
  }

  public async runBeforeFetch(ctx: FetchContext): Promise<void> {
    for (const hook of this.beforeFetchHooks) {
      await hook(ctx);
    }
  }

  public async runAfterFetch(ctx: FetchContext, res: Response) {
    for (const hook of this.afterFetchHooks) {
      const result = await hook(ctx, res);
      if (result === "retry") {
        return "retry";
      }
    }
  }

  public async getMe<T = unknown>(): Promise<T> {
    return wrappedFetch<T>(this, "/me", {
      method: "GET",
    });
  }

  public async signOut(data: SignOutRequest): Promise<SignOutResponse> {
    return wrappedFetch<SignOutResponse>(this, "/sign-out", {
      method: "POST",
      body: toSnakeCaseKeys(data),
    });
  }

  public getPlugin<T extends Plugin>(id: string): T | undefined {
    return this.plugins.find((plugin) => plugin.id === id) as T | undefined;
  }
}
