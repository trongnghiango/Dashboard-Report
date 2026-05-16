import "dotenv/config";
import { db } from "../index.js";
import { 
  usersTable, 
  rolesTable, 
  resourcesTable, 
  permissionsTable, 
  rolePermissionsTable,
  userRolesTable 
} from "../schema/auth.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding RBAC data...");

  // 1. Create Resources
  const resources = [
    { code: "dashboard", name: "Tổng Quan" },
    { code: "production", name: "Báo Cáo Sản Xuất" },
    { code: "orders", name: "Đơn Hàng" },
    { code: "waste", name: "Phế Liệu" },
    { code: "performance", name: "Hiệu Suất" },
  ];

  for (const res of resources) {
    await db.insert(resourcesTable).values(res).onConflictDoNothing();
  }
  console.log("✅ Resources seeded.");

  // 2. Create Permissions (READ & WRITE for each resource)
  const allResources = await db.select().from(resourcesTable);
  const actions = ["READ", "WRITE"];

  for (const res of allResources) {
    for (const action of actions) {
      await db.insert(permissionsTable).values({
        resourceId: res.id,
        action: action,
      }).onConflictDoNothing();
    }
  }
  console.log("✅ Permissions seeded.");

  // 3. Create Roles
  const roles = [
    { code: "admin", name: "Quản trị viên" },
    { code: "manager", name: "Quản lý" },
    { code: "operator", name: "Nhân viên vận hành" },
  ];

  for (const role of roles) {
    await db.insert(rolesTable).values(role).onConflictDoNothing();
  }
  console.log("✅ Roles seeded.");

  // 4. Assign Permissions to Roles
  const adminRole = (await db.select().from(rolesTable).where(eq(rolesTable.code, "admin")))[0];
  const allPermissions = await db.select().from(permissionsTable);

  // Admin gets all permissions
  for (const perm of allPermissions) {
    await db.insert(rolePermissionsTable).values({
      roleId: adminRole.id,
      permissionId: perm.id,
    }).onConflictDoNothing();
  }
  console.log("✅ Admin permissions assigned.");

  // 5. Create Default Admin User
  const adminUser = {
    id: "admin-id",
    username: "admin",
    passwordHash: await bcrypt.hash("admin123", 10),
    fullName: "System Administrator",
    isActive: 1,
  };

  await db.insert(usersTable).values(adminUser).onConflictDoNothing();
  await db.insert(userRolesTable).values({
    userId: adminUser.id,
    roleId: adminRole.id,
  }).onConflictDoNothing();
  console.log("✅ Default admin user created.");

  console.log("✨ Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
