# 00 — Phân tích Nghiệp vụ & Kiến trúc Backend
## Admin Module: Settings + User Management + RBAC Matrix

---

## A. Phân loại Module

| Module | Tier | Lý do |
|---|---|---|
| `Settings` | Tier 1 — Foundation | Không có logic nghiệp vụ, chỉ lưu K/V config toàn hệ thống |
| `User Management` | Tier 2 — Domain Core | User là entity DNA của hệ thống |
| `RBAC Management` | Tier 1 — Foundation | Kiểm soát truy cập, dùng chung toàn hệ thống |

**Dependency tree:**
- `Settings` ← không phụ thuộc gì
- `RBAC` ← phụ thuộc vào schema đã có (`roles`, `permissions`, `resources`, `role_permissions`)
- `User Management` ← phụ thuộc vào `RBAC` (gán role cho user)

---

## B. Bounded Context & Ubiquitous Language

| Tên nghiệp vụ | Tên kỹ thuật |
|---|---|
| Cấu hình hệ thống | `system_settings` (key-value store) |
| Danh sách tài nguyên | `resources` (Dashboard, Production, Orders…) |
| Nhóm quyền | `roles` (admin, manager, viewer…) |
| Quyền chi tiết | `permissions` (resource_id + action) |
| Phân quyền cho nhóm | `role_permissions` (role_id + permission_id) |
| Gán nhóm cho user | `user_roles` (user_id + role_id) |
| Ma trận quyền | `RolePermissionsMatrix` (derived view từ các bảng trên) |

---

## C. Data Flow & API Design

### Settings Module
```
Client → GET /api/settings → SettingsController → SettingsService → DB (system_settings)
Client → PATCH /api/settings → SettingsController → SettingsService → DB (upsert)
```

### User Management
```
Client → GET /api/users → UserController → UserService → DrizzleUserRepository → DB
Client → POST /api/users → UserController → UserService → hash + insert → DB
Client → PATCH /api/users/:id → UserController → UserService → update → DB
Client → DELETE /api/users/:id → UserController → UserService → soft-delete (isActive=0) → DB
```

### RBAC Management
```
Client → GET /api/rbac/resources → RbacController → RbacService → DB
Client → GET /api/rbac/roles → RbacController → RbacService → DB
Client → POST /api/rbac/roles → RbacController → RbacService → insert → DB
Client → GET /api/rbac/matrix/:roleId → RbacController → RbacService → JOIN query → Ma trận
Client → PATCH /api/rbac/matrix/:roleId → RbacController → RbacService → Transaction (delete old + insert new) → DB
Client → POST /api/rbac/users/:userId/roles → RbacController → RbacService → userRoles → DB
```

---

## D. Endpoints & Permissions

| Method | Path | Permission Required |
|---|---|---|
| GET | /api/settings | `settings:READ` |
| PATCH | /api/settings | `settings:UPDATE` |
| GET | /api/users | `users:READ` |
| POST | /api/users | `users:CREATE` |
| PATCH | /api/users/:id | `users:UPDATE` |
| DELETE | /api/users/:id | `users:DELETE` |
| GET | /api/rbac/resources | `rbac:READ` |
| GET | /api/rbac/roles | `rbac:READ` |
| POST | /api/rbac/roles | `rbac:CREATE` |
| GET | /api/rbac/matrix/:roleId | `rbac:READ` |
| PATCH | /api/rbac/matrix/:roleId | `rbac:UPDATE` |
| POST | /api/rbac/users/:userId/roles | `rbac:UPDATE` |

---

## E. Schema cần thêm mới

Chỉ cần thêm bảng `system_settings`. Tất cả các bảng RBAC và User đã tồn tại.

```typescript
export const systemSettingsTable = pgTable("system_settings", {
  key: text("key").primaryKey(),          // e.g., 'system.name', 'smtp.host'
  value: text("value").notNull(),          // JSON string hoặc plain text
  category: text("category").notNull(),    // 'profile' | 'system' | 'technical'
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

---

## F. Multi-tenancy

Hệ thống này là **single-tenant** (Dashboard nội bộ). Không cần `organizationId`.
Admin check dựa trên `abilities` trong JWT token.

---

## G. Security & Server-Driven UI

Các endpoint nhạy cảm (CREATE, UPDATE, DELETE) bảo vệ bằng `authorize()` middleware.
Response User trả về `_actions` để FE hiển thị/ẩn nút:

```json
{
  "id": "...",
  "username": "aminh",
  "isActive": 1,
  "_actions": {
    "edit": { "allowed": true },
    "deactivate": { "allowed": true },
    "delete": { "allowed": false }
  }
}
```
