import { pgTable, text, serial, integer, timestamp, uniqueIndex, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(), // UUID string
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name"),
  isActive: integer("is_active").default(1), // 1: active, 0: inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // e.g. 'admin', 'manager'
});

export const resourcesTable = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // e.g. 'orders', 'production'
});

export const permissionsTable = pgTable("permissions", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").references(() => resourcesTable.id).notNull(),
  action: text("action").notNull(), // CREATE, READ, UPDATE, DELETE
}, (t) => [
  uniqueIndex("idx_resource_action").on(t.resourceId, t.action),
]);

export const rolePermissionsTable = pgTable("role_permissions", {
  roleId: integer("role_id").references(() => rolesTable.id).notNull(),
  permissionId: integer("permission_id").references(() => permissionsTable.id).notNull(),
}, (t) => [
  uniqueIndex("idx_role_permission").on(t.roleId, t.permissionId),
]);

export const userRolesTable = pgTable("user_roles", {
  userId: text("user_id").references(() => usersTable.id).notNull(),
  roleId: integer("role_id").references(() => rolesTable.id).notNull(),
}, (t) => [
  uniqueIndex("idx_user_role").on(t.userId, t.roleId),
]);

export const permissionGroupsTable = pgTable("permission_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const permissionGroupItemsTable = pgTable("permission_group_items", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => permissionGroupsTable.id).notNull(),
  resourceId: integer("resource_id").references(() => resourcesTable.id).notNull(),
  action: text("action").notNull(),
}, (t) => [
  uniqueIndex("idx_group_item").on(t.groupId, t.resourceId, t.action),
]);

export const roleTemplatesTable = pgTable("role_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const roleTemplateGroupsTable = pgTable("role_template_groups", {
  templateId: integer("template_id").references(() => roleTemplatesTable.id).notNull(),
  groupId: integer("group_id").references(() => permissionGroupsTable.id).notNull(),
}, (t) => [
  uniqueIndex("idx_template_group").on(t.templateId, t.groupId),
]);

export const roleTemplatePermissionsTable = pgTable("role_template_permissions", {
  templateId: integer("template_id").references(() => roleTemplatesTable.id).notNull(),
  resourceId: integer("resource_id").references(() => resourcesTable.id).notNull(),
  action: text("action").notNull(),
}, (t) => [
  uniqueIndex("idx_template_permission").on(t.templateId, t.resourceId, t.action),
]);

export const refreshTokensTable = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => usersTable.id).notNull(),
  token: text("token").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_refresh_tokens_user").on(t.userId),
]);

export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);
