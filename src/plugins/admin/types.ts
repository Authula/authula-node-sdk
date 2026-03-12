import { z } from "zod";

import { sessionSchema, type Account, type User } from "@/types";

// ------------------------------
// SCHEMAS
// ------------------------------

export const adminUserStateSchema = z.object({
  userId: z.string().nonempty(),
  isBanned: z.boolean(),
  bannedAt: z.iso.datetime().nullable(),
  bannedUntil: z.iso.datetime().nullable(),
  bannedReason: z.string().nullable(),
  bannedByUserId: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type AdminUserState = z.infer<typeof adminUserStateSchema>;

export const adminSessionStateSchema = z.object({
  sessionId: z.string().nonempty(),
  revokedAt: z.iso.datetime().nullable(),
  revokedReason: z.string().nullable(),
  revokedByUserId: z.string().nullable(),
  impersonatorUserId: z.string().nullable(),
  impersonationReason: z.string().nullable(),
  impersonationExpiresAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type AdminSessionState = z.infer<typeof adminSessionStateSchema>;

export const adminUserSessionSchema = z.object({
  session: sessionSchema,
  state: adminSessionStateSchema.nullable(),
});
export type AdminUserSession = z.infer<typeof adminUserSessionSchema>;

export const impersonationSchema = z.object({
  id: z.string().nonempty(),
  actorUserId: z.string().nonempty(),
  targetUserId: z.string().nonempty(),
  actorSessionId: z.string().nullable(),
  impersonationSessionId: z.string().nullable(),
  reason: z.string().nonempty(),
  startedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  endedAt: z.iso.datetime().nullable(),
  endedByUserId: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Impersonation = z.infer<typeof impersonationSchema>;

// ------------------------------
// API response types
// ------------------------------

// User management

export type CreateUserRequest = {
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
  metadata?: Record<string, unknown>;
};

export type CreateUserResponse = {
  user: User;
};

export type GetAllUsersResponse = {
  users: Array<User>;
  nextCursor?: string | null;
};

export type GetUserByIdResponse = {
  user: User;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  emailVerified?: boolean;
  image?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateUserResponse = {
  user: User;
};

export type DeleteUserResponse = {
  message: string;
};

// Account management

export type CreateAccountRequest = {
  providerId: string;
  accountId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  scope?: string;
  password?: string;
};

export type CreateAccountResponse = {
  account: Account;
};

export type GetUserAccountsResponse = {
  accounts: Array<Account>;
};

export type GetAccountByIdResponse = {
  account: Account;
};

export type UpdateAccountRequest = {
  providerId?: string;
  accountId?: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  scope?: string;
  password?: string;
};

export type UpdateAccountResponse = {
  account: Account;
};

export type DeleteAccountResponse = {
  message: string;
};

// User state management

export type GetUserStateResponse = {
  state: AdminUserState;
};

export type CreateUserStateRequest = {
  banned: boolean;
  bannedUntil?: string;
  bannedReason?: string;
};

export type UpdateUserStateRequest = {
  banned: boolean;
  bannedUntil?: string;
  bannedReason?: string;
};

export type CreateUserStateResponse = {
  userState: AdminUserState;
};

export type UpdateUserStateResponse = {
  userState: AdminUserState;
};

export type DeleteUserStateResponse = {
  message: string;
};

export type GetBannedUserStatesResponse = Array<AdminUserState>;

export type BanUserRequest = {
  bannedUntil?: string;
  reason?: string;
};

export type BanUserResponse = {
  state: AdminUserState;
};

export type UnbanUserResponse = {
  state: AdminUserState;
};

export type GetUserAdminSessionsResponse = Array<AdminUserSession>;

// Session state management

export type GetSessionStateResponse = {
  state: AdminSessionState;
};

export type CreateSessionStateRequest = {
  revoke: boolean;
  revokedReason?: string;
  impersonatorUserId?: string;
  impersonationReason?: string;
  impersonationExpiresAt?: string;
};

export type UpdateSessionStateRequest = {
  revoke: boolean;
  revokedReason?: string;
  impersonatorUserId?: string;
  impersonationReason?: string;
  impersonationExpiresAt?: string;
};

export type CreateSessionStateResponse = {
  state: AdminSessionState;
};

export type UpdateSessionStateResponse = {
  state: AdminSessionState;
};

export type DeleteSessionStateResponse = {
  message: string;
};

export type GetRevokedSessionStatesResponse = Array<AdminSessionState>;

export type RevokeSessionRequest = {
  reason?: string;
};

export type RevokeSessionResponse = {
  sessionState: AdminSessionState;
};

// Impersonation

export type GetAllImpersonationsResponse = Array<Impersonation>;

export type GetImpersonationByIdResponse = {
  impersonation: Impersonation;
};

export type StartImpersonationRequest = {
  targetUserId: string;
  reason: string;
  expiresInSeconds?: number;
};

export type StartImpersonationResponse = {
  impersonation: Impersonation;
};

export type StopImpersonationResponse = {
  message: string;
};
