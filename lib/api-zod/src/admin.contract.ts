import { z } from "zod";

// ─── Settings ────────────────────────────────────────────────────────────────

export const settingCategorySchema = z.enum(["profile", "system", "technical"]);

export const settingItemSchema = z.object({
  key: z.string(),
  value: z.string(),
  category: settingCategorySchema,
});

export const updateSettingsSchema = z.object({
  settings: z.array(settingItemSchema).min(1),
});

export type SettingItem = z.infer<typeof settingItemSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

// ─── User Management ─────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  fullName: z.string().min(1).max(100).optional(),
  roleCode: z.string().optional(), // e.g., 'admin', 'manager'
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  isActive: z.number().int().min(0).max(1).optional(),
  roleCode: z.string().optional(),
});

export const userActionsSchema = z.object({
  edit: z.object({ allowed: z.boolean() }),
  deactivate: z.object({ allowed: z.boolean() }),
  delete: z.object({ allowed: z.boolean() }),
});

export const adminUserResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string().nullable(),
  isActive: z.number(),
  roles: z.array(z.object({ id: z.number(), name: z.string(), code: z.string() })),
  createdAt: z.string().optional(),
  _actions: userActionsSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AdminUserResponse = z.infer<typeof adminUserResponseSchema>;

// ─── RBAC Management ─────────────────────────────────────────────────────────

export const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50).regex(/^[a-z_]+$/, "Code chỉ được gồm chữ thường và dấu gạch dưới"),
});

export const roleResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
});

export const resourceResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
});

// Ma trận quyền: key = resourceCode, value = danh sách action được phép
export const rolePermissionsMatrixSchema = z.object({
  roleId: z.number(),
  roleName: z.string(),
  // { "orders": ["READ", "CREATE"], "production": ["READ"] }
  permissions: z.record(z.string(), z.array(z.string())),
});

export const updateRolePermissionsSchema = z.object({
  // Key: resourceCode, Value: array of allowed actions
  permissions: z.record(z.string(), z.array(z.string())),
});

export const assignRoleSchema = z.object({
  roleCode: z.string(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type RoleResponse = z.infer<typeof roleResponseSchema>;
export type ResourceResponse = z.infer<typeof resourceResponseSchema>;
export type RolePermissionsMatrix = z.infer<typeof rolePermissionsMatrixSchema>;
export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
