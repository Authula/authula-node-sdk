import type { AuthulaClient } from "@/core/client";
import type { Plugin } from "@/core/types";
import { wrapGenerated } from "@/core/utils/wrap-generated";
import * as apiKey from "../../gen/endpoints/api-keys/api-keys";

export class ApiKeyPlugin implements Plugin {
  public readonly id = "apiKey";

  constructor() {}

  public init(client: AuthulaClient) {
    return wrapGenerated(apiKey, client);
  }
}
