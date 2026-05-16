# FE Execution Tasks: TanStack Router Refactor

## Giai đoạn 1: Chuẩn bị & Cài đặt
- [ ] Cài đặt `@tanstack/react-router` vào `@workspace/production-dashboard`.
- [ ] Tạo file `src/router.tsx` (Điểm cấu hình tập trung).
- [ ] Cấu hình `RouterContext` để nhận `auth` và `queryClient`.

## Giai đoạn 2: Định nghĩa Route & Bảo mật
- [ ] Định nghĩa `rootRoute` bọc lấy `Layout`.
- [ ] Tạo `authRoute` bọc các route yêu cầu đăng nhập (dùng `beforeLoad`).
- [ ] Tạo `publicRoute` cho trang `/login`.
- [ ] Chuyển định nghĩa các route Admin (`/admin/users`, `/admin/rbac`, `/admin/settings`) từ `App.tsx` sang Router mới.

## Giai đoạn 3: Tích hợp vào Main App
- [ ] Cập nhật `main.tsx`: Thay thế `WouterRouter` bằng `RouterProvider`.
- [ ] Cập nhật `App.tsx`: Chuyển các định nghĩa Router cũ sang Router mới (hoặc xóa bỏ `App.tsx` nếu đã chuyển hết).
- [ ] Cập nhật `Layout.tsx`:
    - Thay thế `Link` từ `wouter` sang `@tanstack/react-router`.
    - Thay thế logic check active link.
    - Sử dụng `<Outlet />` để render nội dung trang con.

## Giai đoạn 4: Tối ưu hóa (Search Params)
- [ ] Định nghĩa Zod Schema cho trang Sản xuất.
- [ ] Tích hợp `validateSearch` vào route `/san-xuat`.
- [ ] Cập nhật Page Sản xuất để dùng `useSearch` thay vì state local hoặc params cũ.

## Giai đoạn 5: Dọn dẹp
- [ ] Xóa bỏ `ProtectedRoute.tsx` (không còn cần thiết).
- [ ] Gỡ bỏ `wouter` khỏi `package.json`.
- [ ] Kiểm tra lỗi Console và Type TS toàn app.

---
Bạn đã sẵn sàng để tôi bắt đầu viết **CODE** chưa?
