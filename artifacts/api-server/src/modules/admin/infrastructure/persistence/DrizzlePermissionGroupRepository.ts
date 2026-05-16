import { 
  db, 
  permissionGroupsTable, 
  permissionGroupItemsTable,
  resourcesTable
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { PermissionGroup, PermissionItem } from "../../domain/entities/PermissionGroup.entity";
import { IPermissionGroupRepository } from "../../domain/repositories/IPermissionGroupRepository";

export class DrizzlePermissionGroupRepository implements IPermissionGroupRepository {
  async findAll(): Promise<PermissionGroup[]> {
    const groups = await db.select().from(permissionGroupsTable);
    const result: PermissionGroup[] = [];

    for (const g of groups) {
      const items = await db
        .select({
          resourceId: permissionGroupItemsTable.resourceId,
          resourceCode: resourcesTable.code,
          action: permissionGroupItemsTable.action,
        })
        .from(permissionGroupItemsTable)
        .innerJoin(resourcesTable, eq(permissionGroupItemsTable.resourceId, resourcesTable.id))
        .where(eq(permissionGroupItemsTable.groupId, g.id));

      result.push(new PermissionGroup({
        id: g.id,
        name: g.name,
        description: g.description,
        items
      }));
    }

    return result;
  }

  async findById(id: number): Promise<PermissionGroup | null> {
    const [record] = await db.select().from(permissionGroupsTable).where(eq(permissionGroupsTable.id, id));
    if (!record) return null;

    const items = await db
      .select({
        resourceId: permissionGroupItemsTable.resourceId,
        resourceCode: resourcesTable.code,
        action: permissionGroupItemsTable.action,
      })
      .from(permissionGroupItemsTable)
      .innerJoin(resourcesTable, eq(permissionGroupItemsTable.resourceId, resourcesTable.id))
      .where(eq(permissionGroupItemsTable.groupId, id));

    return new PermissionGroup({
      id: record.id,
      name: record.name,
      description: record.description,
      items
    });
  }

  async save(group: PermissionGroup): Promise<PermissionGroup> {
    return await db.transaction(async (tx) => {
      let groupId = group.id;

      if (groupId) {
        await tx.update(permissionGroupsTable)
          .set({ name: group.name, description: group.description })
          .where(eq(permissionGroupsTable.id, groupId));
        
        // Refresh items
        await tx.delete(permissionGroupItemsTable).where(eq(permissionGroupItemsTable.groupId, groupId));
      } else {
        const [inserted] = await tx.insert(permissionGroupsTable)
          .values({ name: group.name, description: group.description })
          .returning();
        groupId = inserted.id;
      }

      if (group.items.length > 0) {
        await tx.insert(permissionGroupItemsTable).values(
          group.items.map(item => ({
            groupId: groupId!,
            resourceId: item.resourceId,
            action: item.action
          }))
        );
      }

      return this.findById(groupId!) as Promise<PermissionGroup>;
    });
  }

  async delete(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(permissionGroupItemsTable).where(eq(permissionGroupItemsTable.groupId, id));
      await tx.delete(permissionGroupsTable).where(eq(permissionGroupsTable.id, id));
    });
  }
}
