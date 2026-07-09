import type { AuthulaClient } from "@/client";
import type { Plugin } from "@/types";
import { wrapGenerated } from "@/utils/wrap-generated";
import * as apiKey from "../../gen/endpoints/api-keys/api-keys";

export class ApiKeyPlugin implements Plugin {
  public readonly id = "apiKey";

  constructor() {}

  public init(client: AuthulaClient) {
    return wrapGenerated(apiKey, client);
  }
}
