import type { AuthulaClient } from "@/client";
import type { Plugin } from "@/types";
import { wrapGenerated } from "@/utils/wrap-generated";
import * as accessControl from "../../gen/endpoints/access-control/access-control";

export class AccessControlPlugin implements Plugin {
  public readonly id = "accessControl";

  constructor() {}

  public init(client: AuthulaClient) {
    return wrapGenerated(accessControl, client);
  }
}
