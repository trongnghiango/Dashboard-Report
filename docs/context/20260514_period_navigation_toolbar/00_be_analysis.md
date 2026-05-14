# Phân tích Nghiệp vụ & Kiến trúc Backend - Bộ lọc Chu kỳ Thời gian

Dựa trên Quyết định Kiến trúc từ luồng `@stax-think` (Hybrid Premium Toolbar), dưới đây là phân tích hệ thống cho lớp Backend:

### A. Phân loại module
- **Tier:** Lớp tính năng này can thiệp vào luồng truy vấn tĩnh thuộc **Tier 3 — Process Flow** (Module Báo cáo Sản xuất & Phân tích OEE).
- **Phụ thuộc:** Phụ thuộc trực tiếp vào các schema tĩnh của `@workspace/db` (`productionTable`, `productionRecordsTable`) và các hợp đồng đầu vào OpenAPI/Zod.

### B. Bounded Context & Ubiquitous Language
- **Domain:** Production Analytics (Phân tích Sản xuất & Hiệu suất Thiết bị).
- **Bảng đối trọng:**
  - Chu kỳ thời gian ↔ `dateFrom`, `dateTo` (ISO Date Strings `YYYY-MM-DD`).
  - Bộ lọc thiết bị ↔ `may` (Tên Máy Tạo Sợi - `mayTS`).

### C. Data Flow & API Design
- **Luồng dữ liệu:** Client truyền các tham số truy vấn `dateFrom`, `dateTo`, `may` vào các API hiện hữu (`GET /api/analytics/summary`, `GET /api/analytics/output-trend`, `GET /api/production`).
- **Tình trạng API:** Các API này **đã hỗ trợ hoàn chỉnh** việc giải mã tham số và áp dụng các mệnh đề SQL `WHERE` / `EXISTS` lồng nhau cực kỳ tối ưu dưới cơ sở dữ liệu PostgreSQL. Không cần khởi tạo thêm endpoint mới.

### D. Cross-module dependencies
- Không phát sinh dependency chéo mới. Hệ thống tiếp tục nạp cấu hình cơ sở dữ liệu qua thư viện `@workspace/db`.
- Không yêu cầu phát sinh Domain Event do đây là tác vụ Đọc (Read-only / Querying).

### E. Multi-tenancy
- Dự án áp dụng mô hình Monorepo xưởng đơn lẻ (Single-tenant Database) theo cấu trúc lược đồ tĩnh. Không áp dụng ranh giới `organizationId` tại các bảng hiện tại.

### F. Security (`_actions` / Server-Driven UI)
- Các dữ liệu đồ thị và xu hướng mang tính chất chuỗi thời gian (Time-series data), trả về mảng phẳng tĩnh phục vụ hiển thị biểu đồ. Không áp dụng cơ chế phán xử quyền nút bấm `_actions` cho các điểm dữ liệu này.
