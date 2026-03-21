import { parse } from "cookie";

import type { FetchContext, Plugin } from "@/types";
import type { CSRFPluginOptions } from "./types";
import type { AuthulaClient } from "@/client";

export class CSRFPlugin implements Plugin {
  public readonly id = "csrf";

  constructor(private readonly options: CSRFPluginOptions) {}

  public init(client: AuthulaClient) {
    client.registerBeforeFetch(async (ctx: FetchContext) => {
      // Client-side
      if (typeof document !== "undefined") {
        if (["OPTIONS", "HEAD", "GET"].includes(ctx.init.method || "GET")) {
          return;
        }

        const cookies = parse(document.cookie);
        const value = cookies[this.options.cookieName];

        if (!value) return;

        ctx.init.headers = new Headers(ctx.init.headers);
        ctx.init.headers.set(this.options.headerName, value);
        return;
      }

      // SSR
      if (this.cookies) {
        if (["OPTIONS", "HEAD", "GET"].includes(ctx.init.method || "GET")) {
          return;
        }

        const store = await this.cookies();
        const cookie = store.get(this.options.cookieName);

        if (!cookie) return;

        ctx.init.headers = new Headers(ctx.init.headers);
        ctx.init.headers.set(this.options.headerName, cookie.value);
      }
    });

    return {};
  }

  // Injected by client
  private cookies?: () => Promise<any>;
  attachCookies(fn: () => Promise<any>) {
    this.cookies = fn;
  }
}
