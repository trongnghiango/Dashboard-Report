import {
  db,
  rolesTable,
  resourcesTable,
  permissionsTable,
  rolePermissionsTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import {
  CreateRoleInput,
  RoleResponse,
  ResourceResponse,
  RolePermissionsMatrix,
} from "@workspace/api-zod";

export class RbacManagementService {
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
}
