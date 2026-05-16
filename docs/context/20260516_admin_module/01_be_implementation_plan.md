# 01 — Kế hoạch Kiến trúc Chi tiết Backend
## Admin Module: Settings + User Management + RBAC Matrix

---

## Thứ tự triển khai

1. Schema DB mới (`system_settings`)
2. Zod Contracts (`lib/api-zod`)
3. Settings module (đơn giản nhất)
4. User Management (CRUD + bcrypt)
5. RBAC Management (Matrix)
6. Đăng ký routes

---

## A. Database Schema

**Mới:** `system_settings` table trong `lib/db/src/schema/settings.ts`
**Tái sử dụng:** `users`, `roles`, `resources`, `permissions`, `role_permissions`, `user_roles`

---

## B. Zod Contracts

File: `lib/api-zod/src/admin.contract.ts`

```typescript
// Settings
settingItemSchema: { key, value, category }
updateSettingsSchema: { settings: settingItemSchema[] }

// Users
createUserSchema: { username, password, fullName, roleId? }
updateUserSchema: { fullName?, isActive?, roleId? }
userResponseSchema: { id, username, fullName, isActive, roles[], _actions }

// RBAC
roleSchema: { id, name, code }
createRoleSchema: { name, code }
resourceSchema: { id, name, code }
rolePermissionsMatrixSchema: { roleId, roleName, permissions: Record<resourceCode, action[]> }
updateRolePermissionsSchema: { permissions: Record<resourceCode, action[]> }
assignRoleSchema: { roleId }
```

---

## C. Application Services

### SettingsService
- `getAll(): Promise<Setting[]>`
- `upsertMany(settings: SettingItem[]): Promise<void>` — Transaction

### UserService
- `getAll(): Promise<UserWithRoles[]>`
- `create(dto): Promise<User>` — bcrypt hash + insert + assign role
- `update(id, dto): Promise<User>` — cập nhật fullName/isActive/role
- `remove(id): Promise<void>` — soft delete (isActive = 0)

### RbacService
- `getResources(): Promise<Resource[]>`
- `getRoles(): Promise<Role[]>`
- `createRole(dto): Promise<Role>`
- `getMatrix(roleId): Promise<RolePermissionsMatrix>`
- `updateMatrix(roleId, permissions): Promise<void>` — Transaction: delete + insert

---

## D. Controllers

- `SettingsController` → routes: `GET/PATCH /api/settings`
- `UserController` → routes: `GET/POST/PATCH/DELETE /api/users`
- `RbacController` → routes: `GET/POST /api/rbac/roles`, `GET/PATCH /api/rbac/matrix/:roleId`, `GET /api/rbac/resources`, `POST /api/rbac/users/:userId/roles`

---

## E. File Structure mới

```
artifacts/api-server/src/
  modules/
    admin/
      application/services/
        Settings.service.ts
        User.service.ts
        Rbac.service.ts
      infrastructure/
        controllers/
          Settings.controller.ts
          User.controller.ts
          Rbac.controller.ts
        persistence/
          DrizzleSettings.repository.ts
          DrizzleAdminUser.repository.ts
          DrizzleRbacMatrix.repository.ts
  routes/
    admin.ts  (gom toàn bộ admin routes)

lib/
  db/src/schema/
    settings.ts   (NEW)
  api-zod/src/
    admin.contract.ts   (NEW)
```
