import type { AuthulaClient } from "@/client";
import { wrappedFetch } from "@/fetch";
import type { Plugin } from "@/types";
import type {
  MagicLinkSignInRequest,
  MagicLinkSignInResponse,
  MagicLinkExchangeRequest,
  MagicLinkVerifyRequest,
  MagicLinkVerifyResponse,
} from "./types";

export class MagicLinkPlugin implements Plugin {
  public readonly id = "magicLink";

  constructor() {}

  public init(client: AuthulaClient) {
    return {
      signIn: async (
        data: MagicLinkSignInRequest,
      ): Promise<MagicLinkSignInResponse> => {
        return wrappedFetch(client, "/magic-link/sign-in", {
          method: "POST",
          body: data,
        });
      },
      verify: async (
        data: MagicLinkVerifyRequest,
      ): Promise<MagicLinkVerifyResponse> => {
        const searchParams = new URLSearchParams();
        searchParams.append("token", data.token);
        if (data.callbackUrl) {
          searchParams.append("callback_url", data.callbackUrl);
        }
        return wrappedFetch(
          client,
          `/magic-link/verify?${searchParams.toString()}`,
          {
            method: "GET",
          },
        );
      },
      exchange: async <T>(data: MagicLinkExchangeRequest): Promise<T> => {
        return wrappedFetch(client, "/magic-link/exchange", {
          method: "POST",
          body: data,
        });
      },
    };
  }
}
