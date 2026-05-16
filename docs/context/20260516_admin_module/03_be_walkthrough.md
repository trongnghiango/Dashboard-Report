## 1. Tóm tắt tính năng (Feature Summary)
- Module: Admin (Tier 1 & 2)
- Endpoints mới: 
  - `/api/admin/settings` (GET/PATCH)
  - `/api/admin/users` (GET/POST/PATCH)
  - `/api/admin/rbac/*` (Matrix, Roles, Resources)
- Database: Thêm bảng `system_settings`.

## 2. Quyết định kiến trúc (Architecture Decisions)
- **Matrix Update:** Sử dụng Transaction để xóa trắng và ghi lại quyền cho Role. Đây là cách an toàn nhất để đồng bộ ma trận từ FE.
- **Settings Category:** Phân loại cấu hình thành `profile`, `system`, `technical` để dễ dàng quản lý trên UI Tabs.
- **Admin Router:** Gom tất cả vào một router riêng và bọc qua `authenticate` middleware để bảo mật tập trung.

## 3. Khó khăn & Xử lý (Troubleshooting)
- `drizzle-kit push` bị treo do npx chờ xác nhận cài đặt → Xử lý bằng cờ `-y`.
- Lỗi thiếu `drizzle-orm` khi chạy từ root → Chuyển sang dùng `pnpm --filter @workspace/db run push`.
