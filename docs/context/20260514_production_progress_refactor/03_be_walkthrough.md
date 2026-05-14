## 1. Tóm tắt tính năng (Feature Summary)
- Tier: 3 — Production Analytics
- Endpoints đã tạo/cập nhật: 
  - `GET /api/analytics/progress-parents`
  - `GET /api/analytics/progress-items` (Đã tích hợp Fix Order-Driven Join)
- Tables/Enums mới: Tận dụng `orders` và `production` đã được bổ sung B-Tree Indexes chuyên biệt.

## 2. Quyết định kiến trúc (Architecture Decisions)
- **Order-Driven Join Strategy:** Đặt `ordersTable` làm "Source of Truth" cho danh sách đơn hàng con chi tiết thuộc một Lệnh XK, loại bỏ rủi ro mất mát key khi dữ liệu Excel đầu vào của bảng `production` bị gõ thô/lệch cột.
- **Phân bổ sản lượng tuần tự có trần (Cascade Cap Fill):** Để khắc phục tình trạng Đơn con đầu tiên "hút trọn gói" toàn bộ lượng rớt key (Greedy consumption) khiến các đơn sau bị 0%, thuật toán mới thiết lập giới hạn: mỗi đơn con chỉ được hút tối đa lượng sản xuất tương đương chỉ tiêu `slDonHang` của nó. Lượng dư thừa tự động tràn sang rót cho đơn tiếp theo. Đơn con cuối cùng của mã sợi đó hưởng trọn lượng dư cuối cùng nhằm đảm bảo tổng sản lượng luôn khớp tuyệt đối 100% với Lệnh cha.

## 3. Khó khăn & Xử lý (Troubleshooting)
- **Lỗi trượt key Gom nhóm và Phân bổ Greedy:** Giải quyết trọn vẹn sự cố dồn hết khối lượng cho đơn đầu tiên bằng cách lưu vết `lastOrderItemIndexByMaSoi` và áp dụng giới hạn `Math.min(remainingInPool, deficit)`. Toàn bộ workspace `@workspace/api-server` đã vượt qua type check với **0 lỗi TypeScript**.

## 4. Bàn giao cho Frontend (Frontend Handoff)
- File Contract Zod: Tự động sinh từ `lib/api-spec/openapi.yaml` thông qua Orval.
- Giao diện: Component con `LazyProgressChildRows` nay sẽ nhận được thuộc tính `orderId` là định danh Đơn hàng con gốc chuẩn xác (Ví dụ: `0750-1`), kèm `slDonHang` thực tế gốc thay vì bị rớt về 0.
