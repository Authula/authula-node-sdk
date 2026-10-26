import type { AuthulaClient } from "@/core/client";
import type { Plugin } from "@/core/types/plugins";
import { wrapGenerated } from "@/core/utils/wrap-generated";
import * as oauth2 from "../../gen/endpoints/oauth2-plugin/oauth2-plugin";

export class OAuth2Plugin implements Plugin {
  public readonly id = "oauth2";

  public init(client: AuthulaClient) {
    return wrapGenerated(oauth2, client);
  }
}
