import { db, usersTable, rolesTable, userRolesTable } from "../../../lib/db/src";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function createUser() {
  const args = process.argv.slice(2);
  const username = args[0] || "admin";
  const password = args[1] || "admin123";
  const fullName = args[2] || "Administrator";
  const roleName = args[3] || "admin";

  console.log(`🚀 Creating user: ${username}...`);

  try {
    // 1. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Insert User
    const [user] = await db.insert(usersTable).values({
      id: crypto.randomUUID(),
      username,
      passwordHash: hashedPassword,
      fullName,
      isActive: 1,
    }).returning();

    console.log(`✅ User created with ID: ${user.id}`);

    // 3. Find Role
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.code, roleName));

    if (role) {
      // 4. Assign Role
      await db.insert(userRolesTable).values({
        userId: user.id,
        roleId: role.id,
      });
      console.log(`✅ Role '${roleName}' assigned to user.`);
    } else {
      console.warn(`⚠️ Role '${roleName}' not found. Skipping role assignment.`);
    }

    console.log("\n✨ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating user:", error);
    process.exit(1);
  }
}

createUser();
