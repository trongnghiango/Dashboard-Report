# Checklist Thực thi Frontend - Cảnh báo Sớm & Quản trị Rủi ro Đơn hàng

Trình tự BẮT BUỘC:

```markdown
- [x] 1. Verify Contracts: Kiểm tra lại mảng `ordersAtRisk` và các trường thuộc tính `OrderRiskForecast` sinh tự động từ Orval.
- [x] 2. Create Component `OrderRiskBanner` (`src/components/order-risk-banner.tsx`):
  - Thiết kế khối cảnh báo sang trọng với các mức độ bôi màu trực quan (Đỏ cho `CRITICAL`, Vàng cho `WARNING`).
  - Hỗ trợ hiển thị chuỗi gợi ý hành động Server-Driven đắt giá kèm tiến độ tương quan.
- [x] 3. Page Mappings (`src/pages/dashboard.tsx`):
  - Tích hợp khối `OrderRiskBanner` ngay bên dưới thanh công cụ `PeriodToolbar`.
  - Kết xuất trạng thái mượt mà (Loading Skeleton khi đang tải, ẩn khối khi trạng thái an toàn toàn vẹn).
- [x] 4. Responsive Verification: Kiểm tra hiển thị vuốt ngang hoặc dàn trang dọc hoàn hảo trên cả Mobile và Desktop.
```

Bạn đã sẵn sàng để tôi bắt đầu viết CODE chưa?
