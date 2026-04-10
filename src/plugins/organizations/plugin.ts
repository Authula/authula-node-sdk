import type { AuthulaClient } from "@/client";
import { wrappedFetch } from "@/fetch";
import type { Plugin } from "@/types";
import type {
  AcceptOrganizationInvitationRequest,
  AcceptOrganizationInvitationResponse,
  AddOrganizationMemberRequest,
  AddOrganizationMemberResponse,
  AddOrganizationTeamMemberRequest,
  AddOrganizationTeamMemberResponse,
  CreateOrganizationInvitationRequest,
  CreateOrganizationInvitationResponse,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  CreateOrganizationTeamRequest,
  CreateOrganizationTeamResponse,
  DeleteOrganizationMemberResponse,
  DeleteOrganizationResponse,
  DeleteOrganizationTeamMemberResponse,
  DeleteOrganizationTeamResponse,
  GetAllOrganizationsResponse,
  GetOrganizationByIdResponse,
  GetOrganizationInvitationResponse,
  GetAllOrganizationInvitationsResponse,
  GetOrganizationMemberResponse,
  GetOrganizationMembersResponse,
  GetOrganizationTeamMemberResponse,
  GetAllOrganizationTeamMembersResponse,
  GetOrganizationTeamsResponse,
  RejectOrganizationInvitationResponse,
  RevokeOrganizationInvitationResponse,
  UpdateOrganizationMemberRequest,
  UpdateOrganizationMemberResponse,
  UpdateOrganizationRequest,
  UpdateOrganizationResponse,
  UpdateOrganizationTeamRequest,
  UpdateOrganizationTeamResponse,
} from "./types";

export class OrganizationsPlugin implements Plugin {
  public readonly id = "organizations";

  public init(client: AuthulaClient) {
    return {
      // Organizations

      createOrganization: async (
        data: CreateOrganizationRequest,
      ): Promise<CreateOrganizationResponse> => {
        return wrappedFetch(client, "/organizations", {
          method: "POST",
          body: data,
        });
      },
      getAllOrganizations: async (): Promise<GetAllOrganizationsResponse> => {
        return wrappedFetch(client, "/organizations", {
          method: "GET",
        });
      },
      getOrganizationById: async (
        organizationId: string,
      ): Promise<GetOrganizationByIdResponse> => {
        return wrappedFetch(client, `/organizations/${organizationId}`, {
          method: "GET",
        });
      },
      updateOrganization: async (
        organizationId: string,
        data: UpdateOrganizationRequest,
      ): Promise<UpdateOrganizationResponse> => {
        return wrappedFetch(client, `/organizations/${organizationId}`, {
          method: "PATCH",
          body: data,
        });
      },
      deleteOrganization: async (
        organizationId: string,
      ): Promise<DeleteOrganizationResponse> => {
        return wrappedFetch(client, `/organizations/${organizationId}`, {
          method: "DELETE",
        });
      },

      // Invitations

      createOrganizationInvitation: async (
        organizationId: string,
        data: CreateOrganizationInvitationRequest,
      ): Promise<CreateOrganizationInvitationResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/invitations`,
          {
            method: "POST",
            body: data,
          },
        );
      },
      getAllOrganizationInvitations: async (
        organizationId: string,
      ): Promise<GetAllOrganizationInvitationsResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/invitations`,
          {
            method: "GET",
          },
        );
      },
      getOrganizationInvitation: async (
        organizationId: string,
        invitationId: string,
      ): Promise<GetOrganizationInvitationResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/invitations/${invitationId}`,
          {
            method: "GET",
          },
        );
      },
      revokeOrganizationInvitation: async (
        organizationId: string,
        invitationId: string,
      ): Promise<RevokeOrganizationInvitationResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/invitations/${invitationId}`,
          {
            method: "PATCH",
          },
        );
      },
      acceptOrganizationInvitation: async (
        organizationId: string,
        invitationId: string,
        data?: AcceptOrganizationInvitationRequest,
      ): Promise<AcceptOrganizationInvitationResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/invitations/${invitationId}/accept`,
          {
            method: "POST",
            body: data,
          },
        );
      },
      rejectOrganizationInvitation: async (
        organizationId: string,
        invitationId: string,
      ): Promise<RejectOrganizationInvitationResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/invitations/${invitationId}/reject`,
          {
            method: "POST",
          },
        );
      },

      // Members

      addOrganizationMember: async (
        organizationId: string,
        data: AddOrganizationMemberRequest,
      ): Promise<AddOrganizationMemberResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/members`,
          {
            method: "POST",
            body: data,
          },
        );
      },
      getAllOrganizationMembers: async (
        organizationId: string,
      ): Promise<GetOrganizationMembersResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/members`,
          {
            method: "GET",
          },
        );
      },
      getOrganizationMember: async (
        organizationId: string,
        memberId: string,
      ): Promise<GetOrganizationMemberResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/members/${memberId}`,
          {
            method: "GET",
          },
        );
      },
      updateOrganizationMember: async (
        organizationId: string,
        memberId: string,
        data: UpdateOrganizationMemberRequest,
      ): Promise<UpdateOrganizationMemberResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/members/${memberId}`,
          {
            method: "PATCH",
            body: data,
          },
        );
      },
      deleteOrganizationMember: async (
        organizationId: string,
        memberId: string,
      ): Promise<DeleteOrganizationMemberResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/members/${memberId}`,
          {
            method: "DELETE",
          },
        );
      },

      // Teams

      createOrganizationTeam: async (
        organizationId: string,
        data: CreateOrganizationTeamRequest,
      ): Promise<CreateOrganizationTeamResponse> => {
        return wrappedFetch(client, `/organizations/${organizationId}/teams`, {
          method: "POST",
          body: data,
        });
      },
      getAllOrganizationTeams: async (
        organizationId: string,
      ): Promise<GetOrganizationTeamsResponse> => {
        return wrappedFetch(client, `/organizations/${organizationId}/teams`, {
          method: "GET",
        });
      },
      updateOrganizationTeam: async (
        organizationId: string,
        teamId: string,
        data: UpdateOrganizationTeamRequest,
      ): Promise<UpdateOrganizationTeamResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/teams/${teamId}`,
          {
            method: "PATCH",
            body: data,
          },
        );
      },
      deleteOrganizationTeam: async (
        organizationId: string,
        teamId: string,
      ): Promise<DeleteOrganizationTeamResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/teams/${teamId}`,
          {
            method: "DELETE",
          },
        );
      },

      // Team members

      addOrganizationTeamMember: async (
        organizationId: string,
        teamId: string,
        data: AddOrganizationTeamMemberRequest,
      ): Promise<AddOrganizationTeamMemberResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/teams/${teamId}/members`,
          {
            method: "POST",
            body: data,
          },
        );
      },
      getAllOrganizationTeamMembers: async (
        organizationId: string,
        teamId: string,
      ): Promise<GetAllOrganizationTeamMembersResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/teams/${teamId}/members`,
          {
            method: "GET",
          },
        );
      },
      getOrganizationTeamMember: async (
        organizationId: string,
        teamId: string,
        memberId: string,
      ): Promise<GetOrganizationTeamMemberResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/teams/${teamId}/members/${memberId}`,
          {
            method: "GET",
          },
        );
      },
      deleteOrganizationTeamMember: async (
        organizationId: string,
        teamId: string,
        memberId: string,
      ): Promise<DeleteOrganizationTeamMemberResponse> => {
        return wrappedFetch(
          client,
          `/organizations/${organizationId}/teams/${teamId}/members/${memberId}`,
          {
            method: "DELETE",
          },
        );
      },
    };
  }
}
