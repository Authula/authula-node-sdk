import type { AuthulaClient } from "@/core/client";
import type { Plugin } from "@/core/types";
import { wrapGenerated } from "@/core/utils/wrap-generated";
import * as emailPassword from "../../gen/endpoints/email-password-plugin/email-password-plugin";

export class EmailPasswordPlugin implements Plugin {
  public readonly id = "emailPassword";

  public init(client: AuthulaClient) {
    return wrapGenerated(emailPassword, client);
  }
}
