import type { AuthulaClient } from "@/client";
import { wrappedFetch } from "@/fetch";
import type { Plugin } from "@/types/plugins";
import type {
  SignInWithOAuth2Request,
  SignInWithOAuth2Response,
} from "./types";

export class OAuth2Plugin implements Plugin {
  public readonly id = "oauth2";

  public init(client: AuthulaClient) {
    return {
      signIn: async (
        data: SignInWithOAuth2Request,
      ): Promise<SignInWithOAuth2Response> => {
        return wrappedFetch(
          client,
          `/oauth2/authorize/${data.provider}?redirect_to=${data.redirectTo}`,
          {
            method: "GET",
          },
        );
      },
    };
  }
}
