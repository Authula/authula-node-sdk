import { z } from "zod";

import type { User } from "@/types";

// ------------------------------
// SCHEMAS
// ------------------------------

export const roleSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().nullish(),
  isSystem: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Role = z.infer<typeof roleSchema>;

export const permissionSchema = z.object({
  id: z.string().nonempty(),
  key: z.string().nonempty(),
  description: z.string().nullish(),
  isSystem: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Permission = z.infer<typeof permissionSchema>;

export const rolePermissionSchema = z.object({
  roleId: z.string().nonempty(),
  permissionId: z.string().nonempty(),
  grantedByUserId: z.string().nullish(),
  grantedAt: z.iso.datetime(),
});
export type RolePermission = z.infer<typeof rolePermissionSchema>;

export const userRoleSchema = z.object({
  userId: z.string().nonempty(),
  roleId: z.string().nonempty(),
  assignedByUserId: z.string().nullish(),
  assignedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime().nullish(),
});
export type UserRole = z.infer<typeof userRoleSchema>;

// ------------------------------
// API response types
// ------------------------------

// Role management

export type CreateRoleRequest = {
  name: string;
  description?: string | null;
  isSystem: boolean;
};

export type CreateRoleResponse = {
  role: Role;
};

export type UpdateRoleRequest = {
  name?: string;
  description?: string | null;
};

export type UpdateRoleResponse = {
  role: Role;
};

export type DeleteRoleResponse = {
  message: string;
};

// Permission management

export type CreatePermissionRequest = {
  key: string;
  description?: string | null;
  isSystem: boolean;
};

export type CreatePermissionResponse = {
  permission: Permission;
};

export type UpdatePermissionRequest = {
  description?: string | null;
};

export type UpdatePermissionResponse = {
  permission: Permission;
};

export type DeletePermissionResponse = {
  message: string;
};

// Role-Permission management

export type AddRolePermissionRequest = {
  permissionId: string;
};

export type AddRolePermissionResponse = {
  message: string;
};

export type ReplaceRolePermissionsRequest = {
  permissionIds: string[];
};

export type ReplaceRolePermissionResponse = {
  message: string;
};

export type RemoveRolePermissionResponse = {
  message: string;
};

// User-Role management

export type AssignUserRoleRequest = {
  roleId: string;
  expiresAt?: string | null;
};

export type AssignUserRoleResponse = {
  message: string;
};

export type ReplaceUserRolesRequest = {
  roleIds: string[];
};

export type ReplaceUserRolesResponse = {
  message: string;
};

export type RemoveUserRoleResponse = {
  message: string;
};

// User-Permission management

export type GetUserEffectivePermissionsResponse = {
  permissions: UserPermissionInfo[];
};

export type UserRoleInfo = {
  roleId: string;
  roleName: string;
  roleDescription?: string | null;
  assignedByUserId?: string | null;
  assignedAt?: string | null;
  expiresAt?: string | null;
};

export type PermissionGrantSource = {
  roleId: string;
  roleName: string;
  grantedByUserId?: string | null;
  grantedAt?: string | null;
};

export type UserPermissionInfo = {
  permissionId: string;
  permissionKey: string;
  permissionDescription?: string | null;
  grantedByUserId?: string | null;
  grantedAt?: string | null;
  sources?: PermissionGrantSource[];
};

export type UserWithRoles = {
  user: User;
  roles: UserRoleInfo[];
};

export type UserWithPermissions = {
  user: User;
  permissions: UserPermissionInfo[];
};

export type UserAuthorizationProfile = {
  user: User;
  roles: UserRoleInfo[];
  permissions: UserPermissionInfo[];
};

export type RoleDetails = {
  role: Role;
  permissions: UserPermissionInfo[];
};
