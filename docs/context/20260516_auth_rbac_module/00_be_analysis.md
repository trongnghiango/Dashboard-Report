# Phân tích Nghiệp vụ & Kiến trúc: AT/RT Authentication System

## A. Phân loại module
- **Phân tầng:** Tier 1 — Foundation (Auth/Session Management).
- **Lý do:** Đây là cơ chế bảo mật nền tảng, mọi module khác đều phụ thuộc vào kết quả xác thực này.
- **Phụ thuộc:** `UserModule`, `RbacModule`.

## B. Bounded Context & Ubiquitous Language
- **Domain:** Quản lý phiên làm việc (Session/Token Management).
- **Bảng đối trọng:**
  - Phiên đăng nhập ↔ `refresh_tokens`
  - Token truy cập ↔ `accessToken` (Short-lived JWT)
  - Token làm mới ↔ `refreshToken` (Long-lived, Database-backed)
  - Xoay vòng Token ↔ Token Rotation (Cấp mới AT+RT, hủy RT cũ)
  - Giới hạn thiết bị ↔ Max Concurrent Sessions (FIFO eviction)

## C. Data Flow & API Design
- **Flow:** Client → `Auth.controller` → `Auth.service` → `RefreshTokenRepository` → `Postgres`.
- **API Endpoints:**
  - `POST /api/auth/login`: Trả về `accessToken` (Body) và `refresh_token` (HttpOnly Cookie).
  - `POST /api/auth/refresh`: Nhận `refresh_token` (Cookie), kiểm tra DB, xoay vòng Token.
  - `POST /api/auth/logout`: Xóa `refresh_token` trong DB và xóa Cookie ở Client.

## D. Cross-module dependencies
- Phụ thuộc `IUserRepository` để lấy thông tin user khi refresh.
- Phụ thuộc `IRbacRepository` để đóng gói `abilities` vào `accessToken` (hoặc trả về kèm AT).

## E. Multi-tenancy
- `refresh_tokens` gắn chặt với `userId`. Tính đa thuê (multi-tenancy) đã được đảm bảo ở cấp độ User.

## F. Security & Protection
- **HttpOnly Cookie:** Ngăn chặn XSS đọc Refresh Token.
- **Token Rotation:** Mỗi lần refresh sẽ hủy RT cũ, cấp RT mới. Nếu hacker dùng RT cũ đã bị xoay vòng, hệ thống có thể cảnh báo (Replay Detection).
- **FIFO Eviction:** Tự động đăng xuất thiết bị cũ nhất khi vượt quá 5 phiên.

[🛑 HARD STOP]: Vui lòng gõ 'OK' để tôi tiến hành thiết kế kiến trúc chi tiết.
