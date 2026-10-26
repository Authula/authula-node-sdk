import type { AuthulaClient } from "@/core/client";
import type { Plugin } from "@/core/types/plugins";
import { wrapGenerated } from "@/core/utils/wrap-generated";
import * as totp from "../../gen/endpoints/totp-plugin/totp-plugin";

export class TOTPPlugin implements Plugin {
  public readonly id = "totp";

  public init(client: AuthulaClient) {
    return wrapGenerated(totp, client);
  }
}
