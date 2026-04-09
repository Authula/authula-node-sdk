export type Organization = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  logo: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationInvitationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "revoked"
  | "expired";

export type OrganizationInvitation = {
  id: string;
  email: string;
  inviterId: string;
  organizationId: string;
  role: string;
  status: OrganizationInvitationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationTeam = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationTeamMember = {
  id: string;
  teamId: string;
  memberId: string;
  createdAt: string;
};

export type CreateOrganizationRequest = {
  name: string;
  slug?: string | null;
  logo?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type CreateOrganizationResponse = Organization;

export type GetAllOrganizationsResponse = Array<Organization>;

export type GetOrganizationByIdResponse = Organization;

export type UpdateOrganizationRequest = {
  name: string;
  slug?: string | null;
  logo?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type UpdateOrganizationResponse = Organization;

export type DeleteOrganizationResponse = {
  message: string;
};

export type AddOrganizationMemberRequest = {
  userId: string;
  role: string;
};

export type AddOrganizationMemberResponse = OrganizationMember;

export type GetOrganizationMembersResponse = Array<OrganizationMember>;

export type GetOrganizationMemberByIdResponse = OrganizationMember;

export type UpdateOrganizationMemberRequest = {
  role: string;
};

export type UpdateOrganizationMemberResponse = OrganizationMember;

export type DeleteOrganizationMemberResponse = {
  message: string;
};

export type CreateOrganizationTeamRequest = {
  name: string;
  slug?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type CreateOrganizationTeamResponse = OrganizationTeam;

export type GetOrganizationTeamsResponse = Array<OrganizationTeam>;

export type UpdateOrganizationTeamRequest = {
  name: string;
  slug?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type UpdateOrganizationTeamResponse = OrganizationTeam;

export type DeleteOrganizationTeamResponse = {
  message: string;
};

export type AddOrganizationTeamMemberRequest = {
  memberId: string;
};

export type AddOrganizationTeamMemberResponse = OrganizationTeamMember;

export type GetOrganizationTeamMembersResponse = Array<OrganizationTeamMember>;

export type GetOrganizationTeamMemberByIdResponse = OrganizationTeamMember;

export type DeleteOrganizationTeamMemberResponse = {
  message: string;
};

export type CreateOrganizationInvitationRequest = {
  email: string;
  role: string;
  redirectUrl?: string;
};

export type CreateOrganizationInvitationResponse = OrganizationInvitation;

export type GetOrganizationInvitationsResponse = Array<OrganizationInvitation>;

export type GetOrganizationInvitationByIdResponse = OrganizationInvitation;

export type RevokeOrganizationInvitationResponse = OrganizationInvitation;

export type AcceptOrganizationInvitationRequest = {
  redirectUrl?: string;
};

export type AcceptOrganizationInvitationResponse = OrganizationInvitation;

export type RejectOrganizationInvitationResponse = OrganizationInvitation;
