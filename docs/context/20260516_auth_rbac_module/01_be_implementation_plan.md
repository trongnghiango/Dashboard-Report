# Kế hoạch Kiến trúc Chi tiết: AT/RT Authentication System

## A. Database Schema — Drizzle ORM
### [NEW] `refreshTokensTable`
- `id`: serial primary key.
- `userId`: text (FK users.id) not null.
- `token`: text not null unique.
- `userAgent`: text nullable.
- `ipAddress`: varchar(45) nullable.
- `expiresAt`: timestamp not null.
- `createdAt`: timestamp default now() not null.
- **Indexes:**
  - `idx_rt_user_id`: Index trên `userId`.
  - `idx_rt_token`: Unique index trên `token`.

## B. Domain Layer
- **Entity:** `RefreshToken` (Properties: id, userId, token, expiresAt, etc.)
- **Repository Interface (Port):** `IRefreshTokenRepository` (Symbol)
  - `create(token: RefreshToken): Promise<void>`
  - `findByToken(token: string): Promise<RefreshToken | null>`
  - `deleteByToken(token: string): Promise<void>`
  - `deleteOldestSession(userId: string): Promise<void>`
  - `countByUserId(userId: string): Promise<number>`
  - `updateToken(oldToken: string, newToken: string, newExpiresAt: Date): Promise<void>`

## C. Infrastructure Layer
- **Implementation:** `DrizzleRefreshTokenRepository` kế thừa `DrizzleBaseRepository`.
- **Mapper:** `RefreshTokenMapper` chuyển đổi giữa Database Record và Domain Entity.

## D. Application Layer — AuthService Nâng cấp
- **`login(dto)`**: 
  - Tạo AT (15m) + RT (7d).
  - Kiểm tra số lượng phiên hiện có. Nếu >= 5, gọi `deleteOldestSession`.
  - Lưu RT mới vào DB.
- **`refresh(token)`**:
  - Tìm RT trong DB. Nếu không thấy hoặc hết hạn -> Throw `UnauthorizedException`.
  - Tạo AT mới + RT mới.
  - Cập nhật RT cũ thành RT mới trong DB (Rotation).
- **`logout(token)`**:
  - Xóa RT khỏi DB.

## E. Presentation Layer & Contracts
- **Shared Contracts (`lib/api-zod`)**:
  - Cập nhật `AuthResponse` để chứa `accessToken`.
  - Thêm `RefreshResponse`.
- **Controller**:
  - `login`: Sử dụng `res.cookie()` để set HttpOnly Cookie.
  - `refresh`: Đọc cookie từ `req.cookies`.
  - `logout`: Gọi `res.clearCookie()`.

## F. Module Wiring
- Gắn `IRefreshTokenRepository` vào `AuthModule`.

Kế hoạch này đã chuẩn chưa? Nếu OK, tôi sẽ xuất Checklist.
