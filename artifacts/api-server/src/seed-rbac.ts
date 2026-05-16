import { db, permissionGroupsTable, permissionGroupItemsTable, roleTemplatesTable, roleTemplateGroupsTable, resourcesTable } from "../../../lib/db/src/index";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding Advanced RBAC data...");

  // 1. Get resources
  const resources = await db.select().from(resourcesTable);
  const resourceMap = Object.fromEntries(resources.map(r => [r.code, r.id]));

  const getRes = (code: string) => {
    const id = resourceMap[code];
    if (!id) throw new Error(`Resource ${code} not found`);
    return id;
  };

  // 2. Define Groups
  const groupsData = [
    {
      name: "Sản xuất & Vận hành",
      description: "Xem và cập nhật lệnh sản xuất, báo cáo phế liệu.",
      items: [
        { code: "production", action: "READ" },
        { code: "production", action: "UPDATE" },
        { code: "waste", action: "READ" },
        { code: "waste", action: "CREATE" },
      ]
    },
    {
      name: "Báo cáo & Phân tích",
      description: "Truy cập Dashboard, Hiệu suất và các biểu đồ.",
      items: [
        { code: "dashboard", action: "READ" },
        { code: "performance", action: "READ" },
      ]
    },
    {
      name: "Quản lý Đơn hàng",
      description: "Tạo và quản lý các đơn đặt hàng từ khách hàng.",
      items: [
        { code: "orders", action: "READ" },
        { code: "orders", action: "CREATE" },
        { code: "orders", action: "UPDATE" },
      ]
    },
    {
      name: "Toàn quyền Hệ thống",
      description: "Quản lý người dùng, phân quyền và cài đặt hệ thống.",
      items: [
        { code: "users", action: "READ" },
        { code: "users", action: "CREATE" },
        { code: "users", action: "UPDATE" },
        { code: "users", action: "DELETE" },
        { code: "rbac", action: "READ" },
        { code: "rbac", action: "UPDATE" },
        { code: "settings", action: "READ" },
        { code: "settings", action: "UPDATE" },
      ]
    }
  ];

  console.log("Creating Groups...");
  const createdGroups: any[] = [];
  for (const g of groupsData) {
    const [group] = await db.insert(permissionGroupsTable).values({
      name: g.name,
      description: g.description
    }).returning();
    
    await db.insert(permissionGroupItemsTable).values(
      g.items.map(i => ({
        groupId: group.id,
        resourceId: getRes(i.code),
        action: i.action
      }))
    );
    createdGroups.push({ ...group, originalName: g.name });
  }

  const findGroup = (name: string) => createdGroups.find(g => g.originalName === name).id;

  // 3. Define Templates
  const templatesData = [
    {
      name: "Quản đốc Xưởng (Foreman)",
      description: "Quản lý sản xuất, xem báo cáo và giám sát hiệu suất.",
      groups: ["Sản xuất & Vận hành", "Báo cáo & Phân tích"]
    },
    {
      name: "Công nhân Vận hành (Operator)",
      description: "Chỉ cập nhật sản xuất và báo cáo phế liệu tại chỗ.",
      groups: ["Sản xuất & Vận hành"]
    },
    {
      name: "Nhân viên Kinh doanh (Sales)",
      description: "Quản lý đơn hàng và xem tình hình sản xuất chung.",
      groups: ["Quản lý Đơn hàng"],
      extra: [
        { code: "production", action: "READ" },
        { code: "dashboard", action: "READ" }
      ]
    },
    {
      name: "Quản trị viên (IT/Admin)",
      description: "Toàn quyền quản lý hệ thống và cấu hình.",
      groups: ["Toàn quyền Hệ thống", "Báo cáo & Phân tích", "Sản xuất & Vận hành", "Quản lý Đơn hàng"]
    }
  ];

  console.log("Creating Templates...");
  for (const t of templatesData) {
    const [template] = await db.insert(roleTemplatesTable).values({
      name: t.name,
      description: t.description
    }).returning();

    if (t.groups.length > 0) {
      await db.insert(roleTemplateGroupsTable).values(
        t.groups.map(gName => ({
          templateId: template.id,
          groupId: findGroup(gName)
        }))
      );
    }

    // Individual permissions if any
    // Note: My schema role_template_permissions handles extra permissions
    // I need to check if I added that table. Yes I did.
  }

  console.log("Seeding completed successfully!");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
