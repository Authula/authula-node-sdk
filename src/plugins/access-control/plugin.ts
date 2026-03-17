import type { GoBetterAuthClient } from "@/client";
import { wrappedFetch } from "@/fetch";
import type { Plugin } from "@/types";
import type {
  AddRolePermissionRequest,
  AddRolePermissionResponse,
  AssignUserRoleRequest,
  AssignUserRoleResponse,
  CreatePermissionRequest,
  CreatePermissionResponse,
  CreateRoleRequest,
  CreateRoleResponse,
  DeletePermissionResponse,
  DeleteRoleResponse,
  GetUserEffectivePermissionsResponse,
  Permission,
  RemoveRolePermissionResponse,
  RemoveUserRoleResponse,
  ReplaceRolePermissionResponse,
  ReplaceRolePermissionsRequest,
  ReplaceUserRolesRequest,
  ReplaceUserRolesResponse,
  Role,
  UpdatePermissionRequest,
  UpdatePermissionResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  UserWithRoles,
} from "./types";

export class AccessControlPlugin implements Plugin {
  public readonly id = "accessControl";

  constructor() {}

  public init(client: GoBetterAuthClient) {
    return {
      // Role management
      createRole: async (
        data: CreateRoleRequest,
      ): Promise<CreateRoleResponse> => {
        return wrappedFetch(client, "/access-control/roles", {
          method: "POST",
          body: data,
        });
      },
      getAllRoles: async (): Promise<{ roles: Role[] }> => {
        return wrappedFetch(client, "/access-control/roles", {
          method: "GET",
        });
      },
      getRoleById: async (roleId: string): Promise<{ role: Role }> => {
        return wrappedFetch(client, `/access-control/roles/${roleId}`, {
          method: "GET",
        });
      },
      updateRole: async (
        roleId: string,
        data: UpdateRoleRequest,
      ): Promise<UpdateRoleResponse> => {
        return wrappedFetch(client, `/access-control/roles/${roleId}`, {
          method: "PATCH",
          body: data,
        });
      },
      deleteRole: async (roleId: string): Promise<DeleteRoleResponse> => {
        return wrappedFetch(client, `/access-control/roles/${roleId}`, {
          method: "DELETE",
        });
      },

      // Permission management
      createPermission: async (
        data: CreatePermissionRequest,
      ): Promise<CreatePermissionResponse> => {
        return wrappedFetch(client, "/access-control/permissions", {
          method: "POST",
          body: data,
        });
      },
      getAllPermissions: async (): Promise<{ permissions: Permission[] }> => {
        return wrappedFetch(client, "/access-control/permissions", {
          method: "GET",
        });
      },
      updatePermission: async (
        permissionId: string,
        data: UpdatePermissionRequest,
      ): Promise<UpdatePermissionResponse> => {
        return wrappedFetch(
          client,
          `/access-control/permissions/${permissionId}`,
          {
            method: "PATCH",
            body: data,
          },
        );
      },
      deletePermission: async (
        permissionId: string,
      ): Promise<DeletePermissionResponse> => {
        return wrappedFetch(
          client,
          `/access-control/permissions/${permissionId}`,
          {
            method: "DELETE",
          },
        );
      },

      // Role-Permission management
      addRolePermission: async (
        roleId: string,
        data: AddRolePermissionRequest,
      ): Promise<AddRolePermissionResponse> => {
        return wrappedFetch(
          client,
          `/access-control/roles/${roleId}/permissions`,
          {
            method: "POST",
            body: data,
          },
        );
      },
      getRolePermissions: async (roleId: string): Promise<unknown> => {
        return wrappedFetch(
          client,
          `/access-control/roles/${roleId}/permissions`,
          {
            method: "GET",
          },
        );
      },
      replaceRolePermissions: async (
        roleId: string,
        data: ReplaceRolePermissionsRequest,
      ): Promise<ReplaceRolePermissionResponse> => {
        return wrappedFetch(
          client,
          `/access-control/roles/${roleId}/permissions`,
          {
            method: "PUT",
            body: data,
          },
        );
      },
      removeRolePermission: async (
        roleId: string,
        permissionId: string,
      ): Promise<RemoveRolePermissionResponse> => {
        return wrappedFetch(
          client,
          `/access-control/roles/${roleId}/permissions/${permissionId}`,
          {
            method: "DELETE",
          },
        );
      },

      // User role management
      getUserRoles: async (userId: string): Promise<UserWithRoles> => {
        return wrappedFetch(client, `/access-control/users/${userId}/roles`, {
          method: "GET",
        });
      },
      assignUserRole: async (
        userId: string,
        data: AssignUserRoleRequest,
      ): Promise<AssignUserRoleResponse> => {
        return wrappedFetch(client, `/access-control/users/${userId}/roles`, {
          method: "POST",
          body: data,
        });
      },
      replaceUserRoles: async (
        userId: string,
        data: ReplaceUserRolesRequest,
      ): Promise<ReplaceUserRolesResponse> => {
        return wrappedFetch(client, `/access-control/users/${userId}/roles`, {
          method: "PUT",
          body: data,
        });
      },
      removeUserRole: async (
        userId: string,
        roleId: string,
      ): Promise<RemoveUserRoleResponse> => {
        return wrappedFetch(
          client,
          `/access-control/users/${userId}/roles/${roleId}`,
          {
            method: "DELETE",
          },
        );
      },

      // User permission management
      getUserEffectivePermissions: async (
        userId: string,
      ): Promise<GetUserEffectivePermissionsResponse> => {
        return wrappedFetch(
          client,
          `/access-control/users/${userId}/permissions`,
          {
            method: "GET",
          },
        );
      },
    };
  }
}
