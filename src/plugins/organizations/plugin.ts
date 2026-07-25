import type { AuthulaClient } from "@/client";
import type { Plugin } from "@/types";
import { wrapGenerated } from "@/utils/wrap-generated";
import * as organizations from "../../gen/endpoints/organizations/organizations";
import * as organizationInvitations from "../../gen/endpoints/organization-invitations/organization-invitations";
import * as organizationMembers from "../../gen/endpoints/organization-members/organization-members";
import * as organizationTeams from "../../gen/endpoints/organization-teams/organization-teams";
import * as organizationTeamMembers from "../../gen/endpoints/organization-team-members/organization-team-members";

export class OrganizationsPlugin implements Plugin {
  public readonly id = "organizations";

  public init(client: AuthulaClient) {
    return wrapGenerated(
      {
        ...organizations,
        ...organizationInvitations,
        ...organizationMembers,
        ...organizationTeams,
        ...organizationTeamMembers,
      },
      client,
    );
  }
}
