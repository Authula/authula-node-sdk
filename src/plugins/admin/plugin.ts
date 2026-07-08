import type { AuthulaClient } from "@/client";
import type { Plugin } from "@/types";
import { wrapGenerated } from "@/utils/wrap-generated";
import * as adminAccounts from "../../gen/endpoints/admin-accounts/admin-accounts";
import * as adminImpersonation from "../../gen/endpoints/admin-impersonation/admin-impersonation";
import * as adminSessionState from "../../gen/endpoints/admin-session-state/admin-session-state";
import * as adminUserState from "../../gen/endpoints/admin-user-state/admin-user-state";
import * as adminUsers from "../../gen/endpoints/admin-users/admin-users";

export class AdminPlugin implements Plugin {
  public readonly id = "admin";

  constructor() {}

  public init(client: AuthulaClient) {
    return {
      ...wrapGenerated(adminUsers, client),
      ...wrapGenerated(adminAccounts, client),
      ...wrapGenerated(adminUserState, client),
      ...wrapGenerated(adminSessionState, client),
      ...wrapGenerated(adminImpersonation, client),
    };
  }
}
