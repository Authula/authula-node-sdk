import type { AuthulaClient } from "@/client";
import { wrappedFetch } from "@/fetch";
import type { Plugin } from "@/types";
import type {
  JWKSKey,
  TokenRefreshRequest,
  TokenRefreshResponse,
} from "./types";

export class JWTPlugin implements Plugin {
  public readonly id = "jwt";

  constructor() {}

  public init(client: AuthulaClient) {
    return {
      refreshToken: async (
        data: TokenRefreshRequest,
      ): Promise<TokenRefreshResponse> => {
        return wrappedFetch(client, "/token/refresh", {
          method: "POST",
          body: data,
        });
      },
      getJWKSKeys: async (): Promise<Array<JWKSKey>> => {
        return wrappedFetch(client, "/.well-known/jwks.json", {
          method: "GET",
        });
      },
    };
  }
}
