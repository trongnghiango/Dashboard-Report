# Kế hoạch Kiến trúc Chi tiết (Frontend) — Module Auth & RBAC

Tài liệu này mô tả chi tiết cách triển khai phía Frontend.

## A. Contract Sync
Đồng bộ các Schema từ `lib/api-zod`:
- `LoginRequest`, `AuthResponse`.

## B. API Client (React Query)
Tạo hook `useAuthQuery`:
- `useLoginMutation`: Gọi `POST /api/auth/login`.
- `useMeQuery`: Gọi `GET /api/auth/me`.
- `useLogoutMutation`: Gọi `POST /api/auth/logout`.

## C. Global State (Zustand)
File: `artifacts/production-dashboard/src/stores/useAuthStore.ts`
- `user`: Thông tin người dùng hiện tại.
- `abilities`: Bản đồ quyền hạn `{ [resource]: string[] }`.
- `setAuth(user, abilities)`: Hàm cập nhật sau khi login thành công.
- `clearAuth()`: Hàm xóa khi logout.

## D. Route Protection (TanStack Router)
Cập nhật `rootRoute` hoặc tạo một `_auth` layout route:
- Sử dụng `beforeLoad` để kiểm tra `isAuthenticated`.
- Nếu chưa auth, redirect sang `/login` với `redirect` query param để quay lại sau khi đăng nhập.

## E. UI Components
- **Layout**: Ẩn/hiện Sidebar items dựa trên `abilities`.
- **Can Component**:
  ```tsx
  <Can I="READ" a="production">
    <ProductionTable />
  </Can>
  ```

## F. Authentication Flow
1. App Mount -> `useMeQuery`.
2. Nếu có dữ liệu -> `setAuth`.
3. Nếu không (401) -> `clearAuth`.
4. Login -> Success -> `setAuth` -> Redirect to home.
