# Step 1: UI/UX Analysis (Advanced RBAC)

## Context Check
- Tài liệu Backend liên quan: `docs/context/20260516_advanced_rbac/00_be_analysis.md`
- Endpoints dự kiến:
  - `GET /api/rbac/groups`
  - `GET /api/rbac/templates`
  - `GET /api/rbac/templates/:id`
  - `GET /api/rbac/roles/:id/members`
  - `POST /api/rbac/roles/:id/members`

## Mục tiêu UX
1. **Sidebar Navigation**: Chuyển từ bảng ma trận phẳng sang giao diện Sidebar (danh sách Role) + Detail (Cấu hình quyền).
2. **Template Integration**: Cho phép áp dụng mẫu (Preset) ngay khi đang chỉnh sửa Role.
3. **Hierarchy Representation**: Hiển thị quyền theo nhóm (Permission Groups) dưới dạng Accordion để dễ quản lý khi số lượng Resource tăng lên.
4. **Quick User Assignment**: Quản lý thành viên trong Role bằng giao diện "Quick Assign" (Tag-style search).

## Data Flow
- `AdminRoles`: Danh sách role cho Sidebar.
- `RbacMatrix`: Dữ liệu quyền của role hiện tại (vẫn dùng Matrix logic nhưng hiển thị theo Group).
- `RbacTemplates`: Danh sách mẫu để người dùng chọn.
- `RbacGroups`: Dữ liệu định nghĩa các nhóm quyền.

## Server-Driven UI (_actions)
- Frontend sẽ kiểm tra `role._actions` để hiển thị các nút:
  - `edit`: Cho phép thay đổi ma trận quyền.
  - `delete`: Cho phép xóa role.
  - `assign`: Cho phép quản lý thành viên.

---
Vui lòng gõ 'OK' để tôi tiến hành thiết kế kiến trúc FE.
