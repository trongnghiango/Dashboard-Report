# UI/UX Analysis: TanStack Router Refactor

## 1. Mục tiêu (Objectives)
- Thay thế hoàn toàn `wouter` bằng `@tanstack/react-router`.
- Đảm bảo 100% Type-safety cho Routes, Params và Search Params.
- Tối ưu hóa bảo mật bằng cách sử dụng `beforeLoad` thay cho `<ProtectedRoute>`.
- Chuẩn bị nền tảng để ứng dụng mở rộng (scaling) trong tương lai.

## 2. Phân tích hiện trạng (Current State)
- **Library:** `wouter` (Simple, No type safety).
- **Layout:** Đang bọc thủ công trong từng Route hoặc qua `ProtectedRoute`.
- **Auth Guard:** Dùng Component bọc (`<ProtectedRoute>`), dễ gây "flicker" giao diện khi redirect.
- **Search Params:** Chưa được validate, fetch data dựa trên `useEffect` hoặc Query đơn lẻ.

## 3. Kiến trúc mục tiêu (Target Architecture)

### A. Cây Route (Route Tree)
- `__root`: Chứa `Layout` component.
- `login`: Route công khai.
- `(auth)`: Nhóm route yêu cầu đăng nhập (Dashboard, Production, Admin...).
  - `admin`: Nhóm route quản trị cấp cao.

### B. Auth Guard Flow
1. User truy cập `/admin/users`.
2. Router gọi `beforeLoad`.
3. `beforeLoad` kiểm tra `useAuthStore.getState().isAuthenticated`.
4. Nếu `false` -> `throw redirect({ to: '/login' })`.
5. Nếu `true` -> Cho phép render component.

### C. Data Flow & Search Params
- **Trang Sản xuất (`/san-xuat`):** Định nghĩa `productionSearchSchema` (Zod).
- Router tự động validate URL -> Pass dữ liệu sạch vào `loader` hoặc `useSearch`.

## 4. Logic Server-Driven UI (RBAC)
- Tiếp tục sử dụng hàm `can(resource, action)` từ `useAuthStore`.
- Tích hợp check quyền ngay trong `beforeLoad` cho các route Admin để chặn truy cập từ tầng URL (ví dụ: role User gõ `/admin` sẽ bị đẩy ra ngay).

## 5. Rủi ro & Giải pháp (Risks)
- **Rủi ro:** Gãy liên kết (Broken links) do thay đổi API của thẻ `<Link>`.
- **Giải pháp:** Refactor cuốn chiếu, ưu tiên fix các trang chính trước, sử dụng tính năng `Link` type-safe để TypeScript báo lỗi ngay khi có path sai.

---
Vui lòng gõ **'OK'** để tôi tiến hành thiết kế kiến trúc FE (Bước 2).
