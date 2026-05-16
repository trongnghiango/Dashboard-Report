import { z } from "zod";

// ─── Permission Groups ───────────────────────────────────────────────────────

export const permissionItemSchema = z.object({
  resourceCode: z.string(),
  action: z.string(),
});

export const permissionGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  items: z.array(permissionItemSchema),
});

// ─── Role Templates (Presets) ────────────────────────────────────────────────

export const roleTemplateSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  groupIds: z.array(z.number()),
  extraPermissions: z.array(permissionItemSchema),
});

// ─── Role Members ────────────────────────────────────────────────────────────

export const roleMemberSchema = z.object({
  userId: z.string(),
  username: z.string(),
  fullName: z.string().nullable(),
});

export const updateRoleMembersSchema = z.object({
  userIds: z.array(z.string()),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type PermissionItem = z.infer<typeof permissionItemSchema>;
export type PermissionGroup = z.infer<typeof permissionGroupSchema>;
export type RoleTemplate = z.infer<typeof roleTemplateSchema>;
export type RoleMember = z.infer<typeof roleMemberSchema>;
export type UpdateRoleMembersInput = z.infer<typeof updateRoleMembersSchema>;
