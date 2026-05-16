# 00 — Phân tích UI/UX Frontend
## Admin Module: Settings + User Management + RBAC Matrix

---

## 1. Mục tiêu UX
Cung cấp một bộ công cụ quản trị mạnh mẽ, trực quan và nhất quán với thiết kế hiện tại của Dashboard.

- **Settings:** Dễ dàng tìm kiếm và chỉnh sửa cấu hình hệ thống.
- **Users:** Quản lý danh sách nhân sự, trạng thái hoạt động.
- **RBAC Matrix:** Trực quan hóa quyền hạn phức tạp thành ma trận dễ hiểu.

---

## 2. Data Flow (Dựa trên Backend đã triển khai)

- **GET /api/admin/settings** → React Query `useSettings()`
- **PATCH /api/admin/settings** → React Query `useUpdateSettingsMutation()`
- **GET /api/admin/users** → React Query `useAdminUsers()`
- **POST /api/admin/users** → React Query `useCreateUserMutation()`
- **PATCH /api/admin/users/:id** → React Query `useUpdateUserMutation()`
- **GET /api/admin/rbac/matrix/:roleId** → React Query `useRbacMatrix(roleId)`
- **PATCH /api/admin/rbac/matrix/:roleId** → React Query `useUpdateMatrixMutation()`

---

## 3. Logic Server-Driven UI (`_actions`)

Mỗi row trong danh sách User sẽ có object `_actions`:
- `edit`: Hiển thị/Ẩn nút sửa.
- `deactivate`: Hiển thị/Ẩn switch toggle trạng thái.
- `delete`: Luôn false trong phiên bản này (theo thiết kế backend).

---

## 4. Component Tree dự kiến

### Settings Page
- `SettingsLayout` (Tabs dọc)
  - `ProfileSettings` (Form)
  - `SystemSettings` (Form)
  - `TechnicalSettings` (Form - Masked inputs)

### User Management Page
- `UserPageHeader` (Title + Nút "Thêm User")
- `UserTable` (Sử dụng DataGrid)
  - `UserRowActions` (Dropdown: Reset pass, Deactivate)
- `CreateUserDialog` (Modal Form)

### RBAC Matrix Page
- `RoleSelector` (Select box)
- `PermissionMatrix` (Table)
  - `MatrixHeader` (Actions: READ, CREATE, UPDATE, DELETE)
  - `MatrixRow` (Resource name + Checkboxes)
- `MatrixActions` (Sticky bar: Save/Reset)

---

## 5. Routes mới
- `/admin/settings`
- `/admin/users`
- `/admin/rbac` (hoặc `/admin/permissions`)
