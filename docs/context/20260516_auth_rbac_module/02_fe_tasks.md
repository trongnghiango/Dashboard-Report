# Checklist Thực thi (Frontend) — Auth & RBAC

## 🟢 Store & API Client
- [x] 1. Tạo `useAuthStore` (Zustand) tại `src/stores/auth.ts`.
- [x] 2. Tạo các hooks API (`useLoginMutation`, `useMeQuery`) tại `src/hooks/api/useAuth.ts`.

## 🟡 Route Protection
- [x] 3. Cấu hình `beforeLoad` trong TanStack Router để bảo vệ các route Dashboard.
- [x] 4. Tạo trang `/login` và xử lý logic Redirect sau khi đăng nhập.

## 🟠 UI Components
- [x] 5. Tạo Component `Can` để bọc các UI cần phân quyền.
- [x] 6. Cập nhật `Sidebar` để ẩn các item mà user không có quyền.

## 🔴 Polish & Test
- [x] 7. Kiểm tra luồng: Login -> Redirect -> Dashboard.
- [x] 8. Kiểm tra luồng: F5 -> Tự động login (Hydration).
- [x] 9. Kiểm tra luồng: Logout -> Xóa store -> Quay về trang Login.
