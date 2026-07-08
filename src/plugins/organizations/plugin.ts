import type { AuthulaClient } from "@/client";
import type { Plugin } from "@/types";
import { wrapGenerated } from "@/utils/wrap-generated";
import * as organizations from "../../gen/endpoints/organizations/organizations";

export class OrganizationsPlugin implements Plugin {
  public readonly id = "organizations";

  public init(client: AuthulaClient) {
    return wrapGenerated(organizations, client);
  }
}
