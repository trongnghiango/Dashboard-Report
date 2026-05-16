# 01 — Kế hoạch Kiến trúc FE
## Admin Module: Settings + User Management + RBAC Matrix

---

## 1. API Client Hooks (React Query)
File: `src/hooks/api/useAdmin.ts`
- `useSettings()` / `useUpdateSettings()`
- `useAdminUsers()` / `useCreateUser()` / `useUpdateUser()`
- `useRbacRoles()` / `useRbacResources()` / `useRbacMatrix(roleId)` / `useUpdateMatrix()`

## 2. Component Structure
- `src/components/admin/`
  - `Settings/ProfileForm.tsx`, `Settings/SystemForm.tsx`, `Settings/TechnicalForm.tsx`
  - `Users/UserTable.tsx`, `Users/CreateUserModal.tsx`
  - `RBAC/PermissionMatrix.tsx`

## 3. Pages
- `src/pages/admin/settings.tsx`
- `src/pages/admin/users.tsx`
- `src/pages/admin/rbac.tsx`

## 4. Navigation
- Thêm các mục quản trị vào `Sidebar` trong `Layout`.

## 5. State Management
- Không dùng Zustand cho dữ liệu admin, hoàn toàn dùng React Query cache.
- Local state trong `PermissionMatrix` để tracking thay đổi checkboxes trước khi bấm Save.
