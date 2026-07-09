import type { AuthulaClient } from "@/client";
import type { Plugin } from "@/types";
import { wrapGenerated } from "@/utils/wrap-generated";
import * as jwt from "../../gen/endpoints/jwt-plugin/jwt-plugin";

export class JWTPlugin implements Plugin {
  public readonly id = "jwt";

  constructor() {}

  public init(client: AuthulaClient) {
    return wrapGenerated(jwt, client);
  }
}
