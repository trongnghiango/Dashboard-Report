# Kế hoạch Kiến trúc Chi tiết Backend — Production Progress Refactor

## A. Database Schema — Drizzle ORM
- **Tên bảng:** Phụ thuộc vào hai bảng chính có sẵn `production` (`productionTable`) và `orders` (`ordersTable`) tại `lib/db/src/schema/production.ts`.
- **Chiến lược tối ưu hóa Index (Mandatory Performance Fix):** 
  Bổ sung trực tiếp các B-Tree Index chuyên biệt để phục vụ cho các mệnh đề `GROUP BY` và `LEFT JOIN` tốc độ cao:
  ```typescript
  // Cập nhật tại: lib/db/src/schema/production.ts
  import { index } from "drizzle-orm/pg-core";
  
  // Bảng orders: index cột donHang
  export const ordersTable = pgTable("orders", { ... }, (t) => ({
    donHangIdx: index("idx_orders_don_hang").on(t.donHang),
  }));

  // Bảng production: index cột lenhXK và donHang
  export const productionTable = pgTable("production", { ... }, (t) => ({
    lenhXkIdx: index("idx_production_lenh_xk").on(t.lenhXK),
    donHangIdx: index("idx_production_don_hang").on(t.donHang),
  }));
  ```
- **Migrate Strategy:** Sử dụng `pnpm --filter @workspace/db run generate` hoặc đẩy thẳng migration qua công cụ Drizzle-kit hiện hành.

## B. Domain Layer & SQL Aggregation Port
- **Entity / Aggregate Concept:** Do kiến trúc đọc (Read Model) phục vụ thống kê trực tiếp tốc độ cao, lớp Domain được định hình thông qua DTO của tiến độ cha và tiến độ chi tiết.
- **Aggregation Logic:** Loại bỏ hoàn toàn truy vấn kéo dữ liệu thô về Node.js để chạy hàm Map, thiết kế Port quy ước thực thi trực tiếp các phép tính gom nhóm cấp thấp:
  - `sum(tongSLNgay)` gom theo `lenhXK` trên bảng `production`.
  - `sum(slDonHang)` gom theo `donHang` trên bảng `orders`.

## C. Infrastructure Layer — Drizzle Query Execution
- **Đường dẫn truy vấn:** Khai báo trực tiếp tại `artifacts/api-server/src/routes/production.ts`.
- **Triển khai kỹ thuật SQL Aggregation:**
  ```typescript
  // Truy vấn gom nhóm cha (Parents)
  const prodGroup = db
    .select({
      lenhXK: productionTable.lenhXK,
      tongDaSanXuat: sql<number>`SUM(${productionTable.tongSLNgay}::numeric)::float`.as("tong_da_san_xuat"),
    })
    .from(productionTable)
    .where(isNotNull(productionTable.lenhXK))
    .groupBy(productionTable.lenhXK)
    .as("pg");

  const orderGroup = db
    .select({
      donHang: ordersTable.donHang,
      tongSlDonHang: sql<number>`SUM(${ordersTable.slDonHang}::numeric)::float`.as("tong_sl_don_hang"),
    })
    .from(ordersTable)
    .where(isNotNull(ordersTable.donHang))
    .groupBy(ordersTable.donHang)
    .as("og");

  // Truyền tải chi tiết con theo mô hình Order-Driven Join kết hợp Cascade Cap Fill
  // 1. Lấy danh sách Đơn con chuẩn từ orders
  const orderItems = await db
    .select({
      id: ordersTable.id,
      maSoi: ordersTable.maSoi,
      slDonHang: sql<number>`SUM(COALESCE(${ordersTable.slDonHang}::numeric, 0))::float`.as("sl_don_hang"),
    })
    .from(ordersTable)
    .where(eq(ordersTable.donHang, actualLenhXKStr))
    .groupBy(ordersTable.id, ordersTable.maSoi);

  // 2. Lấy thực tế sản xuất
  const prodItems = await db
    .select({
      maSoi: productionTable.maSoi,
      daSanXuat: sql<number>`SUM(COALESCE(${productionTable.tongSLNgay}::numeric, 0))::float`.as("da_san_xuat"),
    })
    .from(productionTable)
    .where(eq(productionTable.lenhXK, actualLenhXKStr))
    .groupBy(productionTable.maSoi);

  // 3. Phân bổ tuần tự có trần (Cascade Cap Fill)
  // Mỗi đơn con chỉ được hút tối đa lượng bằng slDonHang của nó, lượng dư tiếp tục tràn sang đơn tiếp theo.
  ```

## D. Application Layer — Orchestration
- **Service Handler:** Handler định tuyến chịu trách nhiệm tiếp nhận truy vấn phân trang, gọi tầng Drizzle Aggregation, áp dụng các phép tính tỷ lệ phần trăm an toàn (ngăn chia cho 0) và đóng gói đối tượng phản hồi nguyên khối.
- **Xử lý ngoại lệ:** Bọc trong khối `try/catch`, ghi log bằng `pino` logger tích hợp và trả về chuẩn JSON error.

## E. Presentation Layer & Contracts — OpenAPI / Orval Single Truth
- **Nguồn Sự Thật (Shared Contract Source):** Bắt buộc bổ sung định nghĩa đường dẫn và cấu trúc schema trực tiếp vào tệp OpenAPI chính `lib/api-spec/openapi.yaml`.
- **Cấu trúc DTO quy ước tại OpenAPI:**
  - `ProgressParentSummary`: chứa các trường `lenhXK`, `tongSlDonHang`, `tongDaSanXuat`, `tienDo`, `status`.
  - `ProgressChildItem`: chứa `orderId`, `maSoi`, `slDonHang`, `daSanXuat`, `tienDo`.
- **Đồng bộ tự động:** Chạy lệnh sinh tự động của Orval để cập nhật các tệp DTO tương ứng dưới `@workspace/api-zod` và client React Query.

## F. Module Wiring
- **Định tuyến Express:** Gắn hai handler mới vào router sản xuất tại `artifacts/api-server/src/routes/production.ts`:
  - `router.get("/analytics/progress-parents", ...)`
  - `router.get("/analytics/progress-items", ...)`
- Hoàn toàn tương thích và expose gọn gàng qua cổng API Express hiện tại.
