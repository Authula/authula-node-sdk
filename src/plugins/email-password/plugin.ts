import type { AuthulaClient } from "@/client";
import type { Plugin } from "@/types";
import { wrapGenerated } from "@/utils/wrap-generated";
import * as emailPassword from "../../gen/endpoints/email-password-plugin/email-password-plugin";

export class EmailPasswordPlugin implements Plugin {
  public readonly id = "emailPassword";

  public init(client: AuthulaClient) {
    return wrapGenerated(emailPassword, client);
  }
}
