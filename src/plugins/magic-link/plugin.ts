import type { AuthulaClient } from "@/client";
import type { Plugin } from "@/types";
import { wrapGenerated } from "@/utils/wrap-generated";
import * as magicLink from "../../gen/endpoints/magic-link-plugin/magic-link-plugin";

export class MagicLinkPlugin implements Plugin {
  public readonly id = "magicLink";

  constructor() {}

  public init(client: AuthulaClient) {
    return wrapGenerated(magicLink, client);
  }
}
