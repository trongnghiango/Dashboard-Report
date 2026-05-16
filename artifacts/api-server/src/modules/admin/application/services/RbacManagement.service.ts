import {
  db,
  rolesTable,
  resourcesTable,
  permissionsTable,
  rolePermissionsTable,
  usersTable,
  userRolesTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import {
  CreateRoleInput,
  RoleResponse,
  ResourceResponse,
  RolePermissionsMatrix,
  PermissionGroup,
  RoleTemplate,
  RoleMember,
} from "@workspace/api-zod";
import { IPermissionGroupRepository } from "../../domain/repositories/IPermissionGroupRepository";
import { IRoleTemplateRepository } from "../../domain/repositories/IRoleTemplateRepository";

export class RbacManagementService {
  constructor(
    private readonly groupRepo: IPermissionGroupRepository,
    private readonly templateRepo: IRoleTemplateRepository,
  ) {}
  async getResources(): Promise<ResourceResponse[]> {
    return db.select().from(resourcesTable).orderBy(resourcesTable.name);
  }

  async getRoles(): Promise<RoleResponse[]> {
    return db.select().from(rolesTable).orderBy(rolesTable.name);
  }

  async createRole(dto: CreateRoleInput): Promise<RoleResponse> {
    const [role] = await db.insert(rolesTable).values(dto).returning();
    return role;
  }

  async getMatrix(roleId: number): Promise<RolePermissionsMatrix> {
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, roleId));
    if (!role) throw new Error(`Role ${roleId} không tồn tại`);

    // Lấy tất cả resources
    const resources = await db.select().from(resourcesTable);

    // Lấy tất cả permissions của role này
    const rolePermissions = await db
      .select({
        resourceCode: resourcesTable.code,
        action: permissionsTable.action,
      })
      .from(rolePermissionsTable)
      .innerJoin(permissionsTable, eq(rolePermissionsTable.permissionId, permissionsTable.id))
      .innerJoin(resourcesTable, eq(permissionsTable.resourceId, resourcesTable.id))
      .where(eq(rolePermissionsTable.roleId, roleId));

    // Build ma trận: { resourceCode: [actions] }
    const permissions: Record<string, string[]> = {};
    for (const res of resources) {
      permissions[res.code] = [];
    }
    for (const rp of rolePermissions) {
      if (permissions[rp.resourceCode]) {
        permissions[rp.resourceCode].push(rp.action);
      }
    }

    return { roleId, roleName: role.name, permissions };
  }

  async updateMatrix(roleId: number, newPermissions: Record<string, string[]>): Promise<void> {
    await db.transaction(async (tx) => {
      // Xóa toàn bộ quyền cũ của role này
      await tx.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, roleId));

      // Insert lại theo ma trận mới
      for (const [resourceCode, actions] of Object.entries(newPermissions)) {
        if (!actions || actions.length === 0) continue;

        // Tìm resource
        const [resource] = await tx
          .select()
          .from(resourcesTable)
          .where(eq(resourcesTable.code, resourceCode));
        if (!resource) continue;

        // Tìm các permission records tương ứng
        const perms = await tx
          .select()
          .from(permissionsTable)
          .where(
            and(
              eq(permissionsTable.resourceId, resource.id),
              inArray(permissionsTable.action, actions)
            )
          );

        // Insert role_permissions
        for (const perm of perms) {
          await tx
            .insert(rolePermissionsTable)
            .values({ roleId, permissionId: perm.id })
            .onConflictDoNothing();
        }
      }
    });
  }

  // ─── Advanced RBAC: Groups ──────────────────────────────────────────────────

  async getGroups(): Promise<PermissionGroup[]> {
    const groups = await this.groupRepo.findAll();
    return groups.map(g => ({
      id: g.id!,
      name: g.name,
      description: g.description ?? null,
      items: g.items.map(i => ({
        action: i.action,
        resourceCode: i.resourceCode!
      }))
    }));
  }

  // ─── Advanced RBAC: Templates ───────────────────────────────────────────────

  async getTemplates(): Promise<RoleTemplate[]> {
    const templates = await this.templateRepo.findAll();
    return templates.map(t => ({
      id: t.id!,
      name: t.name,
      description: t.description ?? null,
      groupIds: t.groupIds,
      extraPermissions: t.extraPermissions.map(i => ({
        action: i.action,
        resourceCode: i.resourceCode!
      }))
    }));
  }

  async getTemplateDetail(id: number): Promise<RoleTemplate> {
    const template = await this.templateRepo.findById(id);
    if (!template) throw new Error(`Template ${id} không tồn tại`);
    return {
      id: template.id!,
      name: template.name,
      description: template.description ?? null,
      groupIds: template.groupIds,
      extraPermissions: template.extraPermissions.map(i => ({
        action: i.action,
        resourceCode: i.resourceCode!
      }))
    };
  }

  // ─── Advanced RBAC: Members ────────────────────────────────────────────────

  async getRoleMembers(roleId: number): Promise<RoleMember[]> {
    return db
      .select({
        userId: usersTable.id,
        username: usersTable.username,
        fullName: usersTable.fullName,
      })
      .from(userRolesTable)
      .innerJoin(usersTable, eq(userRolesTable.userId, usersTable.id))
      .where(eq(userRolesTable.roleId, roleId));
  }

  async updateRoleMembers(roleId: number, userIds: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      // Xóa các user cũ
      await tx.delete(userRolesTable).where(eq(userRolesTable.roleId, roleId));

      // Thêm các user mới
      if (userIds.length > 0) {
        await tx.insert(userRolesTable).values(
          userIds.map(userId => ({
            roleId,
            userId
          }))
        );
      }
    });
  }
}
