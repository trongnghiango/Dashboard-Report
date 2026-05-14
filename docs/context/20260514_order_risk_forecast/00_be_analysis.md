# Phân tích Nghiệp vụ & Kiến trúc Backend - Cảnh báo Sớm & Quản trị Rủi ro Đơn hàng

## A. Phân loại module
- **Tier:** Lớp tính năng thuộc **Tier 3 — Process Flow** (Báo cáo & Phân tích Dữ liệu MES), hoạt động lồng ghép trên cấu trúc của Lệnh sản xuất (`production`) và Đơn hàng (`orders`).
- **Phụ thuộc:** Phụ thuộc vào các schema gốc của Tier 2/3 (bảng `orders`, `production`, `production_waste`). Không có module nào phụ thuộc ngược lại vào luồng cảnh báo này.

## B. Bounded Context & Ubiquitous Language
- **Domain:** Production Analytics / Order Forewarning.
- **Bảng đối trọng thuật ngữ:**
  - Lệnh có rủi ro (At-Risk Order) ↔ `OrderRiskForecast`
  - Cấp độ rủi ro (Risk Level) ↔ `riskLevel` (`CRITICAL` | `WARNING` | `SAFE`)
  - Gợi ý hành động (Suggested Action) ↔ `suggestedAction`

## C. Data Flow & API Design
- **Luồng dữ liệu:** Client → Controller (`production.ts`) → Drizzle Subselect / Mapping → DB.
- **API Endpoint:** Mở rộng schema trả về của endpoint hiện tại `GET /api/analytics/summary` bằng cách bổ sung mảng `ordersAtRisk: OrderRiskForecast[]`.

## D. Cross-module dependencies
- Không gọi ngang sang các Service hay Port/Interface của module khác để giữ cho truy vấn SQL thuần khiết và siêu tốc.
- Không phát Domain Event trong phạm vi truy vấn đọc tĩnh này.

## E. Multi-tenancy
- Lọc theo cấu trúc dữ liệu tĩnh nguyên bản của tệp nguồn (bảng dữ liệu Excel tĩnh).

## F. Security (`_actions` / Server-Driven UI)
- Tuân thủ nghiêm ngặt Server-Driven UI: Backend tự động đánh giá và dán nhãn `riskLevel` cũng như chuỗi `suggestedAction` tĩnh. Frontend hoàn toàn độc lập với các biểu thức logic so sánh rủi ro ngầm.

Vui lòng gõ 'OK' để tôi tiến hành thiết kế kiến trúc chi tiết.
