# Step 2: Backend Implementation Plan (Advanced RBAC)

## A. Database Schema — Drizzle ORM
Cập nhật file `lib/db/src/schema/auth.ts`:

1. **`permission_groups` table**:
   - `id`: serial pk
   - `name`: text not null
   - `description`: text

2. **`permission_group_items` table**:
   - `groupId`: integer references permission_groups.id
   - `resourceId`: integer references resources.id
   - `action`: text (CREATE, READ, UPDATE, DELETE)
   - UniqueIndex on (groupId, resourceId, action)

3. **`role_templates` table**:
   - `id`: serial pk
   - `name`: text not null
   - `description`: text

4. **`role_template_groups` table**:
   - `templateId`: integer references role_templates.id
   - `groupId`: integer references permission_groups.id

5. **`role_template_permissions` table**:
   - `templateId`: integer references role_templates.id
   - `resourceId`: integer references resources.id
   - `action`: text

## B. Domain Layer
- **Entities**:
  - `PermissionGroup`: Chứa danh sách `PermissionItem`.
  - `RoleTemplate`: Chứa danh sách `PermissionGroup` và `individualPermissions`.
- **Repositories**:
  - `IPermissionGroupRepository` (Symbol)
  - `IRoleTemplateRepository` (Symbol)
  - Mở rộng `IRoleRepository` để lấy danh sách members.

## C. Infrastructure Layer
- **Mappers**: `PermissionGroupMapper`, `RoleTemplateMapper`.
- **Repositories**: 
  - `DrizzlePermissionGroupRepository`
  - `DrizzleRoleTemplateRepository`
  - Cập nhật `DrizzleAdminUserRepository` (nếu cần) để hỗ trợ list user by role.

## D. Application Layer
- **RbacService**:
  - `getGroups()`: Lấy tất cả nhóm quyền.
  - `getTemplates()`: Lấy danh sách mẫu.
  - `getTemplateDetail(id)`: Lấy chi tiết mẫu để FE "snapshot".
  - `getRoleMembers(roleId)`: Lấy danh sách user của một role.
  - `updateRoleMembers(roleId, userIds)`: Gán lại danh sách user cho role.

## E. Presentation Layer & Contracts
- **Shared Contracts**: Cập nhật `shared/contracts/rbac.ts`.
- **Controller**: `RbacManagement.controller.ts` (Thêm các endpoint mới).

## F. Module Wiring
- Đăng ký các Repository mới vào `AdminModule`.

---
Kế hoạch này đã chuẩn chưa? Nếu OK, tôi sẽ xuất Checklist.
