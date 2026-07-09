import type { AuthulaClient } from "@/client";
import type { Plugin } from "@/types";
import { wrapGenerated } from "@/utils/wrap-generated";
import * as core from "../../gen/endpoints/core/core";

export class CorePlugin implements Plugin {
  public readonly id = "core";

  constructor() {}

  public init(client: AuthulaClient) {
    return wrapGenerated(core, client);
  }
}
