import type { AuthulaClient } from "@/client";
import type { Plugin } from "@/types/plugins";
import { wrapGenerated } from "@/utils/wrap-generated";
import * as oauth2 from "../../gen/endpoints/oauth2-plugin/oauth2-plugin";

export class OAuth2Plugin implements Plugin {
  public readonly id = "oauth2";

  public init(client: AuthulaClient) {
    return wrapGenerated(oauth2, client);
  }
}
