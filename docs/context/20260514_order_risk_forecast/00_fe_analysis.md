# Khởi tạo Context & Phân tích UI/UX Frontend - Cảnh báo Sớm & Quản trị Rủi ro Đơn hàng

## 1. Mục tiêu UX (UX Goals)
- **Nêu bật Rủi ro (Highlight Visibility):** Cung cấp một dải thông báo/bảng cảnh báo (Order Risk Banner/List) cao cấp ngay trên cùng trang Dashboard, giúp C-Level nhận diện tức thời các đơn hàng đang bị chậm tiến độ hoặc hao hụt phế liệu nghiêm trọng.
- **Tương tác Mượt mà:** Cho phép quản đốc xem chi tiết gợi ý can thiệp (Actionable Insights) trực tiếp trên từng thẻ đơn hàng mà không cần chuyển trang.

## 2. Data Flow dự kiến (Expected Data Flow)
- Đồng bộ nguyên vẹn từ API mở rộng `GET /api/analytics/summary` thông qua mảng `ordersAtRisk`.
- Dữ liệu rủi ro tự động cập nhật lại mỗi khi người dùng thay đổi dải ngày trên thanh công cụ `PeriodToolbar` (thông qua cơ chế invalidate cache của React Query).

## 3. Ranh giới Server-Driven UI (Server-Driven Contract)
- Giao diện tuyệt đối không tự đánh giá khi nào một đơn hàng bị trễ hạn. Toàn bộ quyết định hiển thị màu sắc (Đỏ/Vàng/Xanh) và thông điệp hành động được ánh xạ tĩnh từ thuộc tính `riskLevel` và `suggestedAction` do Backend phân phối.

Vui lòng gõ 'OK' để tôi tiến hành thiết kế kiến trúc FE.
