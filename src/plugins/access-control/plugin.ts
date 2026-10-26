import type { AuthulaClient } from "@/core/client";
import type { Plugin } from "@/core/types";
import { wrapGenerated } from "@/core/utils/wrap-generated";
import * as accessControl from "../../gen/endpoints/access-control/access-control";

export class AccessControlPlugin implements Plugin {
  public readonly id = "accessControl";

  constructor() {}

  public init(client: AuthulaClient) {
    return wrapGenerated(accessControl, client);
  }
}
