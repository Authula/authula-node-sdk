import type { AuthulaClient } from "@/core/client";
import type { Plugin } from "@/core/types";
import { wrapGenerated } from "@/core/utils/wrap-generated";
import * as magicLink from "../../gen/endpoints/magic-link-plugin/magic-link-plugin";

export class MagicLinkPlugin implements Plugin {
  public readonly id = "magicLink";

  constructor() {}

  public init(client: AuthulaClient) {
    return wrapGenerated(magicLink, client);
  }
}
