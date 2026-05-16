# Báo cáo Kết quả: Nâng cấp Multi-role RBAC Backend

## 1. Tóm tắt tính năng (Feature Summary)
- **Tier:** 1 — Foundation (Auth/Rbac)
- **Cấu trúc mới:** Hỗ trợ một người dùng có nhiều vai trò (Roles), mỗi vai trò có nhiều quyền hạn (Permissions) dựa trên tài nguyên (Resources).
- **Engine tổng hợp:** Tự động gom tất cả quyền từ các vai trò và loại bỏ trùng lặp trước khi trả về cho Frontend.

## 2. Quyết định kiến trúc (Architecture Decisions)
- **DB-Centric Aggregation:** Sử dụng `selectDistinct` và các phép `innerJoin` trực tiếp trong SQL để tối ưu hiệu năng, giảm tải cho ứng dụng Node.js.
- **Atomic Permissions:** Mỗi quyền hạn được định nghĩa là một cặp duy nhất `(resource, action)`, giúp việc quản lý và kiểm tra quyền cực kỳ chính xác.
- **Backward Compatibility:** Giữ nguyên định dạng dữ liệu trả về (`Record<string, string[]>`) để đảm bảo các thành phần Frontend hiện tại không bị ảnh hưởng.

## 3. Khó khăn & Xử lý (Troubleshooting)
- **Migration Data Loss:** Quá trình xóa cột `role_id` ở bảng `permissions` cũ yêu cầu dùng lệnh `--force`. Đã xử lý bằng cách chạy `push-force` và dùng script seed để tái tạo dữ liệu chuẩn.
- **Postgres onConflict:** Drizzle yêu cầu `target` cụ thể cho các bảng có index duy nhất khi dùng `onConflictDoNothing`. Đã cập nhật logic seed để chỉ định rõ target.

## 4. Bàn giao cho Frontend (Frontend Handoff)
- **Login/Me API:** Vẫn trả về object `abilities`. Tuy nhiên lúc này `abilities` sẽ chứa tập hợp quyền của **TẤT CẢ** các role mà user sở hữu.
- **Dữ liệu mẫu:** Tài khoản `admin / admin123` đã được cấp toàn bộ quyền trên mọi tài nguyên.
