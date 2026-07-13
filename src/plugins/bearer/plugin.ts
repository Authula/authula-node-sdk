import type { FetchContext, Plugin } from "@/types";
import type { ClientWithPlugins } from "@/sdk";
import type { JWTPlugin } from "../jwt/plugin";
import type { BearerPluginOptions } from "./types";

export class BearerPlugin implements Plugin {
  public readonly id = "bearer";
  private refreshPromise: Promise<any> | null = null;

  constructor(private readonly options?: BearerPluginOptions) {}

  public init(client: ClientWithPlugins<[JWTPlugin]>) {
    client.registerBeforeFetch(async (ctx: FetchContext) => {
      if (typeof document === "undefined") {
        return;
      }

      const headerName = this.options?.headerName ?? "Authorization";
      const token = localStorage.getItem("accessToken");
      if (token) {
        if (!(ctx.init.headers instanceof Headers)) {
          ctx.init.headers = new Headers(ctx.init.headers);
        }
        ctx.init.headers.set(headerName, `Bearer ${token}`);
      }
    });

    client.registerAfterFetch(async (ctx: FetchContext, res: Response) => {
      if (typeof document === "undefined") {
        return;
      }
      if (res.status !== 401) {
        return;
      }
      if (ctx.meta.retry) {
        return;
      }

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return;
      }

      if (!client.jwt) {
        console.warn("JWT Plugin is required for Bearer token refresh.");
        return;
      }

      // 🔒 SINGLE FLIGHT REFRESH
      if (!this.refreshPromise) {
        this.refreshPromise = (async () => {
          try {
            const response = await client.jwt.refreshToken({
              refreshToken: refreshToken,
            });
            if (!response) {
              return null;
            }

            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("refreshToken", response.refreshToken);

            return response;
          } finally {
            this.refreshPromise = null;
          }
        })();
      }

      const refreshed = await this.refreshPromise;
      if (!refreshed) {
        return;
      }

      const headerName = this.options?.headerName ?? "Authorization";
      if (!(ctx.init.headers instanceof Headers)) {
        ctx.init.headers = new Headers(ctx.init.headers);
      }
      ctx.init.headers.set(headerName, `Bearer ${refreshed.accessToken}`);

      return "retry";
    });

    return {};
  }
}
