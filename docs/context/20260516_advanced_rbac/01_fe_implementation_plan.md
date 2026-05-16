# Step 2: Frontend Implementation Plan (Advanced RBAC)

## A. Contract Sync
- Import các Zod schema mới từ `shared/contracts/rbac.ts` (sẽ tạo ở bước thực thi).
- Định nghĩa Type: `PermissionGroup`, `RoleTemplate`, `RbacMember`.

## B. API Client (React Query Hooks)
Tạo file `hooks/api/useAdvancedRbac.ts`:
- `useRbacGroups()`: Fetch danh sách gói quyền.
- `useRbacTemplates()`: Fetch danh sách mẫu vai trò.
- `useRbacTemplateDetail(id)`: Fetch chi tiết mẫu để áp dụng.
- `useRoleMembers(roleId)`: Fetch danh sách user thuộc role.
- `useUpdateRoleMembersMutation(roleId)`: Cập nhật thành viên.

## C. Component Tree
1. **`RbacLayout`**: Bố cục Sidebar + Main Workspace.
2. **`RoleSidebar`**: Danh sách role bên trái.
3. **`RoleDetails`**: Container cho Tabs.
4. **`PermissionTab`**:
   - `TemplateSelector`: Thanh ngang chọn mẫu.
   - `HierarchicalMatrix`: Accordion danh sách nhóm quyền.
5. **`MemberTab`**:
   - `MemberSearch`: Ô gõ tên để add user nhanh.
   - `MemberList`: Danh sách user hiện tại.

## D. State Management
- Sử dụng **React Context** hoặc **Zustand** cục bộ trong trang RBAC để quản lý "Temporary Permissions State" (Ma trận quyền đang chỉnh sửa) để việc "Áp dụng mẫu" diễn ra mượt mà trước khi Lưu.
- Cache dữ liệu API bằng React Query.

---
Thiết kế này đã chuẩn chưa? Nếu OK, tôi sẽ xuất Checklist.
