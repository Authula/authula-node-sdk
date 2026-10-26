import type { AuthulaClient } from "@/core/client";
import type { Plugin } from "@/core/types";
import { wrapGenerated } from "@/core/utils/wrap-generated";
import * as jwt from "../../gen/endpoints/jwt-plugin/jwt-plugin";

export class JWTPlugin implements Plugin {
  public readonly id = "jwt";

  constructor() {}

  public init(client: AuthulaClient) {
    return wrapGenerated(jwt, client);
  }
}
