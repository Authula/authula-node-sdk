import { parseCookie } from "cookie";

import type { FetchContext, Plugin } from "@/types";
import type { CSRFPluginOptions } from "./types";
import type { AuthulaClient } from "@/client";

export class CSRFPlugin implements Plugin {
  public readonly id = "csrf";

  constructor(private readonly options: CSRFPluginOptions) {}

  public init(client: AuthulaClient) {
    client.registerBeforeFetch(async (ctx: FetchContext) => {
      if (["OPTIONS", "HEAD", "GET"].includes(ctx.init.method || "GET")) {
        return;
      }

      if (typeof document === "undefined") {
        return;
      }

      const cookies = parseCookie(document.cookie);
      const value = cookies[this.options.cookieName];

      if (!value) return;

      ctx.init.headers = new Headers(ctx.init.headers);
      ctx.init.headers.set(this.options.headerName, value);
    });

    return {};
  }
}
