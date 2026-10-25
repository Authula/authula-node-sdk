import type { AuthulaClient } from "@/core/client";
import type { Plugin } from "@/core/types";
import { wrapGenerated } from "@/core/utils/wrap-generated";
import * as core from "../../gen/endpoints/core/core";

export class CorePlugin implements Plugin {
  public readonly id = "core";

  constructor() {}

  public init(client: AuthulaClient) {
    return wrapGenerated(core, client);
  }
}
