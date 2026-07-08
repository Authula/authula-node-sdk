import type { AuthulaClient } from "@/client";
import type { Plugin } from "@/types/plugins";
import { wrapGenerated } from "@/utils/wrap-generated";
import * as totp from "../../gen/endpoints/totp-plugin/totp-plugin";

export class TOTPPlugin implements Plugin {
  public readonly id = "totp";

  public init(client: AuthulaClient) {
    return wrapGenerated(totp, client);
  }
}
