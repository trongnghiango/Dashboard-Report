import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import {
  SettingItem,
  UpdateSettingsInput,
  AdminUserResponse,
  CreateUserInput,
  UpdateUserInput,
  RoleResponse,
  ResourceResponse,
  RolePermissionsMatrix,
  UpdateRolePermissionsInput,
  PermissionGroup,
  RoleTemplate,
  RoleMember,
  UpdateRoleMembersInput,
} from "@workspace/api-zod";

// ─── Settings ────────────────────────────────────────────────────────────────

export const useAdminSettings = () => {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => customFetch<SettingItem[]>("/api/admin/settings"),
  });
};

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSettingsInput) =>
      customFetch("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => customFetch<AdminUserResponse[]>("/api/admin/users"),
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      customFetch<AdminUserResponse>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      customFetch<AdminUserResponse>(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

// ─── RBAC ───────────────────────────────────────────────────────────────────

export const useAdminRoles = () => {
  return useQuery({
    queryKey: ["admin", "rbac", "roles"],
    queryFn: () => customFetch<RoleResponse[]>("/api/admin/rbac/roles"),
  });
};

export const useAdminResources = () => {
  return useQuery({
    queryKey: ["admin", "rbac", "resources"],
    queryFn: () => customFetch<ResourceResponse[]>("/api/admin/rbac/resources"),
  });
};

export const useRbacMatrix = (roleId: number | null) => {
  return useQuery({
    queryKey: ["admin", "rbac", "matrix", roleId],
    queryFn: () => customFetch<RolePermissionsMatrix>(`/api/admin/rbac/matrix/${roleId}`),
    enabled: !!roleId,
  });
};

export const useUpdateMatrixMutation = (roleId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRolePermissionsInput) =>
      customFetch(`/api/admin/rbac/matrix/${roleId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rbac", "matrix", roleId] });
    },
  });
};

export const useRbacGroups = () => {
  return useQuery({
    queryKey: ["admin", "rbac", "groups"],
    queryFn: () => customFetch<PermissionGroup[]>("/api/admin/rbac/groups"),
  });
};

export const useRbacTemplates = () => {
  return useQuery({
    queryKey: ["admin", "rbac", "templates"],
    queryFn: () => customFetch<RoleTemplate[]>("/api/admin/rbac/templates"),
  });
};

export const useRbacTemplateDetail = (templateId: number | null) => {
  return useQuery({
    queryKey: ["admin", "rbac", "templates", templateId],
    queryFn: () => customFetch<RoleTemplate>(`/api/admin/rbac/templates/${templateId}`),
    enabled: !!templateId,
  });
};

export const useRoleMembers = (roleId: number | null) => {
  return useQuery({
    queryKey: ["admin", "rbac", "roles", roleId, "members"],
    queryFn: () => customFetch<RoleMember[]>(`/api/admin/rbac/roles/${roleId}/members`),
    enabled: !!roleId,
  });
};

export const useUpdateRoleMembersMutation = (roleId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRoleMembersInput) =>
      customFetch(`/api/admin/rbac/roles/${roleId}/members`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rbac", "roles", roleId, "members"] });
    },
  });
};
