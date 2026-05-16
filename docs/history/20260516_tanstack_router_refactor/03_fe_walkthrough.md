# FE Walkthrough: TanStack Router Refactor

## 1. Tóm tắt tính năng (Feature Summary)
- Hệ thống Routing đã được nâng cấp lên `@tanstack/react-router`.
- Định nghĩa cây Route tập trung tại `src/router.tsx`.
- Cập nhật `Layout.tsx` và `App.tsx` để hỗ trợ cơ chế render Nested Routes.
- Tích hợp Zod Search Params Validation cho trang Sản xuất.

## 2. Quyết định kiến trúc UI/UX (Architecture Decisions)
- **Centralized Router Context:** Truyền `auth` store từ Zustand trực tiếp vào Router Context để các route con có thể truy cập trạng thái đăng nhập và quyền hạn một cách type-safe.
- **Router-level Guards:** Sử dụng `beforeLoad` thay cho Component wrapper. Điều này đảm bảo redirect xảy ra trước khi component render, cải thiện UX và bảo mật.
- **Code-based Routing:** Chọn định nghĩa tập trung để dễ dàng refactor từ cấu trúc cũ, đồng thời giữ file entry point (`App.tsx`) cực kỳ gọn gàng.

## 3. Khó khăn & Xử lý (Troubleshooting)
- **Store Mismatch (pnpm):** Gặp lỗi phiên bản store khi cài đặt thư viện. Đã xử lý bằng cách chạy `pnpm install` toàn workspace để đồng bộ lại store v10.
- **Type Errors (Library Exports):** Lỗi không tìm thấy `setOnTokenRefreshed` trong dashboard dù đã export ở lib. Đã xử lý bằng cách chạy `tsc --build` cho thư viện để sinh file `.d.ts` mới.
- **Layout Nesting:** Lỗi render Outlet dư thừa. Đã điều chỉnh để `Layout` tự quản lý Outlet bên trong.

## 4. Hướng phát triển (Next Steps)
- Tiếp tục chuyển đổi các trang còn lại (Dashboard, Orders...) sang sử dụng Type-safe Search Params.
- Tận dụng tính năng `loader` của TanStack Router để fetch data sớm hơn, giảm thời gian chờ (Initial Load Time).
