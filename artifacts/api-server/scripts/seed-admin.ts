import { db, resourcesTable, permissionsTable, rolesTable, rolePermissionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function seedAdminResources() {
  console.log("🚀 Seeding Admin Resources & Permissions...");

  const adminResources = [
    { name: "Người dùng", code: "users" },
    { name: "Phân quyền", code: "rbac" },
    { name: "Cài đặt", code: "settings" },
  ];

  const actions = ["READ", "CREATE", "UPDATE", "DELETE"];

  try {
    // 1. Tìm role admin
    const [adminRole] = await db.select().from(rolesTable).where(eq(rolesTable.code, "admin"));
    if (!adminRole) {
      console.error("❌ Role 'admin' not found. Please create it first.");
      return;
    }

    for (const res of adminResources) {
      // 2. Insert Resource
      const [insertedRes] = await db.insert(resourcesTable).values(res).onConflictDoNothing().returning();
      const targetRes = insertedRes || (await db.select().from(resourcesTable).where(eq(resourcesTable.code, res.code)))[0];

      for (const action of actions) {
        // 3. Insert Permission
        const [insertedPerm] = await db.insert(permissionsTable).values({
          resourceId: targetRes.id,
          action,
        }).onConflictDoNothing().returning();
        
        const targetPerm = insertedPerm || (await db.select().from(permissionsTable).where(
          eq(permissionsTable.resourceId, targetRes.id) && eq(permissionsTable.action, action)
        ))[0];

        // 4. Assign to Admin Role
        if (targetPerm) {
          await db.insert(rolePermissionsTable).values({
            roleId: adminRole.id,
            permissionId: targetPerm.id,
          }).onConflictDoNothing();
        }
      }
    }

    console.log("✨ Admin resources and permissions seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seedAdminResources();
