# Step 1: Business & Architecture Analysis (Advanced RBAC)

## A. Phân loại module
- **Tier**: Tier 1 — Foundation.
- **Lý do**: RBAC (Role-Based Access Control) là thành phần cốt lõi của hệ thống, cung cấp nền tảng phân quyền cho tất cả các module nghiệp vụ khác. Nó không chứa logic nghiệp vụ đặc thù của ngành sợi mà phục vụ quản trị hệ thống.
- **Phụ thuộc**: 
  - Không phụ thuộc vào module nghiệp vụ nào.
  - Được phụ thuộc bởi `Auth` (để kiểm tra quyền) và các module Tier 2, 3 (để áp dụng quyền).

## B. Bounded Context & Ubiquitous Language

| Tên nghiệp vụ (Tiếng Việt) | Tên kỹ thuật (Code) | Mô tả |
|---|---|---|
| Nhóm quyền | PermissionGroup | Tập hợp các hành động (Action) trên các tài nguyên (Resource) liên quan. |
| Mẫu vai trò | RoleTemplate | Một bản thiết kế sẵn chứa nhiều Nhóm quyền và Quyền lẻ để tạo Role nhanh. |
| Vai trò | Role | Một thực thể gán cho User để xác định khả năng truy cập. |
| Tài nguyên | Resource | Đối tượng được bảo vệ (ví dụ: Lệnh sản xuất, Kho). |
| Hành động | Action | Thao tác trên tài nguyên (CREATE, READ, UPDATE, DELETE). |

## C. Data Flow & API Design

Luồng dữ liệu:
`Client (FE)` -> `RbacController` -> `RbacService` -> `RbacRepository` -> `Database (Drizzle)`

Các Endpoint mới cần thiết:
1. `GET /api/rbac/groups`: Lấy danh sách các nhóm quyền.
2. `GET /api/rbac/templates`: Lấy danh sách các mẫu vai trò.
3. `GET /api/rbac/templates/:id`: Chi tiết một mẫu vai trò (bao gồm các nhóm và quyền lẻ).
4. `GET /api/rbac/roles/:id/members`: Lấy danh sách user thuộc role.
5. `POST /api/rbac/roles/:id/members`: Cập nhật danh sách user cho một role.
6. (Mở rộng các API hiện có để hỗ trợ việc tạo role từ template ở Frontend).

## D. Cross-module dependencies
- **Auth Module**: Cần cập nhật để nhận diện các quyền mới nếu có thay đổi về cách lưu trữ (tuy nhiên thiết kế của chúng ta vẫn dựa trên bảng `permissions` cuối cùng, nên Auth không bị ảnh hưởng lớn).
- **Admin Module**: RBAC hiện đang nằm trong `admin` module. Chúng ta sẽ mở rộng module này.

## E. Multi-tenancy
- Hiện tại hệ thống đang dùng `organizationId` trong bảng `users`. Tuy nhiên bảng `roles` và `resources` trong `auth.ts` không thấy có `organizationId`. 
- **Quyết định**: Các Role Templates và Permission Groups sẽ được coi là "System Defaults" (Global), nhưng Roles thực tế và User-Role mapping có thể cần theo Tenant nếu hệ thống mở rộng multi-tenant. Trong giai đoạn này, chúng ta sẽ giữ theo cấu trúc hiện tại (Global config).

## F. Security (_actions / Server-Driven UI)
- `Role` entity cần trả về `_actions`: `canEdit`, `canDelete`, `canAssignUsers`.
- Logic phán xử: Admin tối cao có toàn quyền. Các Role khác không được tự sửa quyền của chính mình.

---
Vui lòng gõ 'OK' để tôi tiến hành thiết kế kiến trúc chi tiết.
