import type { GoBetterAuthClient } from "@/client";
import { wrappedFetch } from "@/fetch";
import type { Plugin } from "@/types";
import type {
  BanUserRequest,
  BanUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  DeleteSessionStateResponse,
  DeleteUserStateResponse,
  StopImpersonationResponse,
  GetAllImpersonationsResponse,
  GetAllUsersResponse,
  GetBannedUserStatesResponse,
  GetImpersonationByIdResponse,
  GetRevokedSessionStatesResponse,
  GetSessionStateResponse,
  GetUserAdminSessionsResponse,
  GetUserByIdResponse,
  GetUserStateResponse,
  RevokeSessionRequest,
  RevokeSessionResponse,
  StartImpersonationRequest,
  StartImpersonationResponse,
  UnbanUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse,
  CreateAccountRequest,
  CreateAccountResponse,
  GetUserAccountsResponse,
  GetAccountByIdResponse,
  UpdateAccountRequest,
  UpdateAccountResponse,
  DeleteAccountResponse,
  CreateUserStateRequest,
  CreateUserStateResponse,
  UpdateUserStateRequest,
  UpdateUserStateResponse,
  CreateSessionStateRequest,
  CreateSessionStateResponse,
  UpdateSessionStateRequest,
  UpdateSessionStateResponse,
} from "./types";

export class AdminPlugin implements Plugin {
  public readonly id = "admin";

  constructor() {}

  public init(client: GoBetterAuthClient) {
    return {
      // User management

      createUser: async (
        data: CreateUserRequest,
      ): Promise<CreateUserResponse> => {
        return wrappedFetch(client, "/admin/users", {
          method: "POST",
          body: data,
        });
      },
      getAllUsers: async (limit?: string): Promise<GetAllUsersResponse> => {
        const urlSearchParams = new URLSearchParams();
        if (limit) {
          urlSearchParams.append("limit", limit);
        }
        const params = urlSearchParams.toString()
          ? `?${urlSearchParams.toString()}`
          : "";
        return wrappedFetch(client, `/admin/users${params}`, {
          method: "GET",
        });
      },
      getUserById: async (userId: string): Promise<GetUserByIdResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}`, {
          method: "GET",
        });
      },
      updateUser: async (
        userId: string,
        data: UpdateUserRequest,
      ): Promise<UpdateUserResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}`, {
          method: "PATCH",
          body: data,
        });
      },
      deleteUser: async (userId: string): Promise<DeleteUserResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}`, {
          method: "DELETE",
        });
      },

      // Account management

      createAccount: async (
        userId: string,
        data: CreateAccountRequest,
      ): Promise<CreateAccountResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}/accounts`, {
          method: "POST",
          body: data,
        });
      },
      getUserAccounts: async (
        userId: string,
      ): Promise<GetUserAccountsResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}/accounts`, {
          method: "GET",
        });
      },
      getAccountById: async (id: string): Promise<GetAccountByIdResponse> => {
        return wrappedFetch(client, `/admin/accounts/${id}`, {
          method: "GET",
        });
      },
      updateAccount: async (
        id: string,
        data: UpdateAccountRequest,
      ): Promise<UpdateAccountResponse> => {
        return wrappedFetch(client, `/admin/accounts/${id}`, {
          method: "PATCH",
          body: data,
        });
      },
      deleteAccount: async (id: string): Promise<DeleteAccountResponse> => {
        return wrappedFetch(client, `/admin/accounts/${id}`, {
          method: "DELETE",
        });
      },

      // User state management

      getUserState: async (userId: string): Promise<GetUserStateResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}/state`, {
          method: "GET",
        });
      },
      createUserState: async (
        userId: string,
        data: CreateUserStateRequest,
      ): Promise<CreateUserStateResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}/state`, {
          method: "POST",
          body: data,
        });
      },
      updateUserState: async (
        userId: string,
        data: UpdateUserStateRequest,
      ): Promise<UpdateUserStateResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}/state`, {
          method: "PATCH",
          body: data,
        });
      },
      deleteUserState: async (
        userId: string,
      ): Promise<DeleteUserStateResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}/state`, {
          method: "DELETE",
        });
      },
      getBannedUserStates: async (): Promise<GetBannedUserStatesResponse> => {
        return wrappedFetch(client, `/admin/users/states/banned`, {
          method: "GET",
        });
      },
      banUser: async (
        userId: string,
        data: BanUserRequest,
      ): Promise<BanUserResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}/ban`, {
          method: "POST",
          body: data,
        });
      },
      unbanUser: async (userId: string): Promise<UnbanUserResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}/unban`, {
          method: "POST",
        });
      },
      getUserAdminSessions: async (
        userId: string,
      ): Promise<GetUserAdminSessionsResponse> => {
        return wrappedFetch(client, `/admin/users/${userId}/sessions`, {
          method: "GET",
        });
      },

      // Session state management

      getSessionState: async (
        sessionId: string,
      ): Promise<GetSessionStateResponse> => {
        return wrappedFetch(client, `/admin/sessions/${sessionId}/state`, {
          method: "GET",
        });
      },
      createSessionState: async (
        sessionId: string,
        data: CreateSessionStateRequest,
      ): Promise<CreateSessionStateResponse> => {
        return wrappedFetch(client, `/admin/sessions/${sessionId}/state`, {
          method: "POST",
          body: data,
        });
      },
      updateSessionState: async (
        sessionId: string,
        data: UpdateSessionStateRequest,
      ): Promise<UpdateSessionStateResponse> => {
        return wrappedFetch(client, `/admin/sessions/${sessionId}/state`, {
          method: "PATCH",
          body: data,
        });
      },
      deleteSessionState: async (
        sessionId: string,
      ): Promise<DeleteSessionStateResponse> => {
        return wrappedFetch(client, `/admin/sessions/${sessionId}/state`, {
          method: "DELETE",
        });
      },
      getRevokedSessionStates:
        async (): Promise<GetRevokedSessionStatesResponse> => {
          return wrappedFetch(client, `/admin/sessions/states/revoked`, {
            method: "GET",
          });
        },
      revokeSession: async (
        sessionId: string,
        data: RevokeSessionRequest,
      ): Promise<RevokeSessionResponse> => {
        return wrappedFetch(client, `/admin/sessions/${sessionId}/revoke`, {
          method: "POST",
          body: data,
        });
      },

      // Impersonations

      getAllImpersonations: async (): Promise<GetAllImpersonationsResponse> => {
        return wrappedFetch(client, "/admin/impersonations", {
          method: "GET",
        });
      },
      getImpersonationById: async (
        impersonationId: string,
      ): Promise<GetImpersonationByIdResponse> => {
        return wrappedFetch(
          client,
          `/admin/impersonations/${impersonationId}`,
          {
            method: "GET",
          },
        );
      },
      startImpersonation: async (
        data: StartImpersonationRequest,
      ): Promise<StartImpersonationResponse> => {
        return wrappedFetch(client, "/admin/impersonations", {
          method: "POST",
          body: data,
        });
      },
      stopImpersonation: async (
        impersonationId: string,
      ): Promise<StopImpersonationResponse> => {
        return wrappedFetch(
          client,
          `/admin/impersonations/${impersonationId}/stop`,
          {
            method: "POST",
          },
        );
      },
    };
  }
}
