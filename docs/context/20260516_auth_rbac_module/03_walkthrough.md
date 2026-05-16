# Walkthrough — Module Auth & RBAC

## 1. Tóm tắt tính năng (Feature Summary)
- **Backend:** 
  - Triển khai hệ thống xác thực JWT (Login, Me, Logout).
  - RBAC dựa trên Resource-Action (Resource: orders, production... Action: READ, CREATE...).
  - Middleware `authenticate` và `authorize` để bảo vệ API.
- **Frontend:**
  - Trang Login chuyên nghiệp.
  - Quản lý trạng thái bằng Zustand.
  - Protected Route bảo vệ toàn bộ Dashboard.
  - Server-Driven UI: Sidebar và các nút bấm tự động ẩn/hiện dựa trên quyền hạn của User.

## 2. Quyết định kiến trúc (Architecture Decisions)
- **Shared Contracts:** Dùng `lib/api-zod` để định nghĩa Schema chung, đảm bảo Type-safety tuyệt đối giữa BE và FE.
- **Clean Architecture:** Tách biệt Domain (Entities) khỏi Infrastructure (Express/Drizzle).
- **Stateless Auth:** Sử dụng JWT Bearer token lưu trong localStorage của trình duyệt.

## 3. Khó khăn & Xử lý (Troubleshooting)
- **Pnpm version mismatch:** Gặp lỗi khi cài đặt dependencies do phiên bản pnpm không khớp. Đã xử lý bằng cách cấu hình lại `package.json` và dùng `npx pnpm`.
- **Express Request Types:** Đã mở rộng interface `Request` của Express để hỗ trợ `req.user`.

## 4. Hướng dẫn kiểm tra (Manual Test)
1. **Seed dữ liệu:** Bạn cần thêm 1 user vào bảng `users` (với password đã được hash bằng bcrypt).
2. **Login:** Truy cập `/login` trên trình duyệt.
3. **Verify:** Sau khi login, Sidebar sẽ chỉ hiển thị các mục mà User có quyền.
