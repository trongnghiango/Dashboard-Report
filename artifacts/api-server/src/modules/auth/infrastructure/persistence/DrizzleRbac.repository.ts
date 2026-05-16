import { eq, inArray } from "drizzle-orm";
import { 
  db, 
  userRolesTable, 
  permissionsTable, 
  resourcesTable, 
  rolePermissionsTable,
  rolesTable,
  usersTable
} from "@workspace/db";
import { IRbacRepository } from "../../domain/repositories/Rbac.repository";
import bcrypt from "bcryptjs";

export class DrizzleRbacRepository implements IRbacRepository {
  async getAbilitiesByUserId(userId: string): Promise<Record<string, string[]>> {
    // Aggregated query with DISTINCT using new N-N structure
    const results = await db
      .selectDistinct({
        resourceCode: resourcesTable.code,
        action: permissionsTable.action,
      })
      .from(userRolesTable)
      .innerJoin(rolePermissionsTable, eq(userRolesTable.roleId, rolePermissionsTable.roleId))
      .innerJoin(permissionsTable, eq(rolePermissionsTable.permissionId, permissionsTable.id))
      .innerJoin(resourcesTable, eq(permissionsTable.resourceId, resourcesTable.id))
      .where(eq(userRolesTable.userId, userId));

    // Group by resource
    const abilities: Record<string, string[]> = {};
    for (const p of results) {
      if (!abilities[p.resourceCode]) {
        abilities[p.resourceCode] = [];
      }
      abilities[p.resourceCode].push(p.action);
    }

    return abilities;
  }
}
