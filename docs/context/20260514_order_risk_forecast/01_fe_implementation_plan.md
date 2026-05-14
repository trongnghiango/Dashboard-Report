# Kế hoạch Kiến trúc UI/UX Frontend - Cảnh báo Sớm & Quản trị Rủi ro Đơn hàng

## A. Contract Sync
- Xác nhận sử dụng giao diện `OrderRiskForecast` sinh tự động từ OpenAPI spec (chứa các thuộc tính: `donHang`, `maSoi`, `tenSoi`, `tyLeHoanThanh`, `tyLePheLieu`, `riskLevel`, `suggestedAction`).

## B. API Client
- Tận dụng hook `useGetSummary` hiện có từ gói `@workspace/api-client-react`, trích xuất trực tiếp mảng `ordersAtRisk` từ đối tượng `data`.

## C. Component Tree
- **[NEW] `src/components/order-risk-banner.tsx`:**
  - Khối giao diện cao cấp dạng Bảng thông báo / Băng chuyền cảnh báo đặt ngay bên dưới thanh công cụ điều hướng `PeriodToolbar`.
  - Hiển thị các Lệnh đang rơi vào trạng thái `CRITICAL` (màu Đỏ) hoặc `WARNING` (màu Vàng) kèm chỉ dẫn hành động đắt giá.
- **[MODIFY] `src/pages/dashboard.tsx`:**
  - Nhúng trực tiếp component `OrderRiskBanner` vào bố cục chính.

## D. State Management
- Lắng nghe sự biến thiên của dải ngày từ kho lưu trữ Zustand `usePeriodStore` để tự động truyền vào query parameters của hook lấy dữ liệu phân tích, đảm bảo kết xuất giao diện liền mạch hoàn toàn.

Thiết kế này đã chuẩn chưa? Nếu OK, tôi sẽ xuất Checklist.
