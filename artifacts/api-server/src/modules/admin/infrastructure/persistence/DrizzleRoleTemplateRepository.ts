import { 
  db, 
  roleTemplatesTable, 
  roleTemplateGroupsTable,
  roleTemplatePermissionsTable,
  resourcesTable
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { RoleTemplate } from "../../domain/entities/RoleTemplate.entity";
import { IRoleTemplateRepository } from "../../domain/repositories/IRoleTemplateRepository";

export class DrizzleRoleTemplateRepository implements IRoleTemplateRepository {
  async findAll(): Promise<RoleTemplate[]> {
    const templates = await db.select().from(roleTemplatesTable);
    const result: RoleTemplate[] = [];

    for (const t of templates) {
      const groups = await db.select().from(roleTemplateGroupsTable).where(eq(roleTemplateGroupsTable.templateId, t.id));
      const extraPerms = await db
        .select({
          resourceId: roleTemplatePermissionsTable.resourceId,
          resourceCode: resourcesTable.code,
          action: roleTemplatePermissionsTable.action,
        })
        .from(roleTemplatePermissionsTable)
        .innerJoin(resourcesTable, eq(roleTemplatePermissionsTable.resourceId, resourcesTable.id))
        .where(eq(roleTemplatePermissionsTable.templateId, t.id));

      result.push(new RoleTemplate({
        id: t.id,
        name: t.name,
        description: t.description,
        groupIds: groups.map(g => g.groupId),
        extraPermissions: extraPerms
      }));
    }

    return result;
  }

  async findById(id: number): Promise<RoleTemplate | null> {
    const [record] = await db.select().from(roleTemplatesTable).where(eq(roleTemplatesTable.id, id));
    if (!record) return null;

    const groups = await db.select().from(roleTemplateGroupsTable).where(eq(roleTemplateGroupsTable.templateId, id));
    const extraPerms = await db
      .select({
        resourceId: roleTemplatePermissionsTable.resourceId,
        resourceCode: resourcesTable.code,
        action: roleTemplatePermissionsTable.action,
      })
      .from(roleTemplatePermissionsTable)
      .innerJoin(resourcesTable, eq(roleTemplatePermissionsTable.resourceId, resourcesTable.id))
      .where(eq(roleTemplatePermissionsTable.templateId, id));

    return new RoleTemplate({
      id: record.id,
      name: record.name,
      description: record.description,
      groupIds: groups.map(g => g.groupId),
      extraPermissions: extraPerms
    });
  }

  async save(template: RoleTemplate): Promise<RoleTemplate> {
    return await db.transaction(async (tx) => {
      let templateId = template.id;

      if (templateId) {
        await tx.update(roleTemplatesTable)
          .set({ name: template.name, description: template.description })
          .where(eq(roleTemplatesTable.id, templateId));
        
        await tx.delete(roleTemplateGroupsTable).where(eq(roleTemplateGroupsTable.templateId, templateId));
        await tx.delete(roleTemplatePermissionsTable).where(eq(roleTemplatePermissionsTable.templateId, templateId));
      } else {
        const [inserted] = await tx.insert(roleTemplatesTable)
          .values({ name: template.name, description: template.description })
          .returning();
        templateId = inserted.id;
      }

      if (template.groupIds.length > 0) {
        await tx.insert(roleTemplateGroupsTable).values(
          template.groupIds.map(groupId => ({
            templateId: templateId!,
            groupId
          }))
        );
      }

      if (template.extraPermissions.length > 0) {
        await tx.insert(roleTemplatePermissionsTable).values(
          template.extraPermissions.map(p => ({
            templateId: templateId!,
            resourceId: p.resourceId,
            action: p.action
          }))
        );
      }

      return this.findById(templateId!) as Promise<RoleTemplate>;
    });
  }

  async delete(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(roleTemplateGroupsTable).where(eq(roleTemplateGroupsTable.templateId, id));
      await tx.delete(roleTemplatePermissionsTable).where(eq(roleTemplatePermissionsTable.templateId, id));
      await tx.delete(roleTemplatesTable).where(eq(roleTemplatesTable.id, id));
    });
  }
}
