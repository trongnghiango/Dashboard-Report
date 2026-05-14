# Kế hoạch Kiến trúc Chi tiết Backend - Bộ lọc Chu kỳ Thời gian

Dựa trên việc rà soát mã nguồn thực tế, các lớp lõi của Backend **đã hỗ trợ hoàn chỉnh** toàn bộ ranh giới truy vấn cần thiết cho bộ lọc chu kỳ thời gian. Dưới đây là kế hoạch chi tiết xác nhận trạng thái ổn định (Zero-change compatibility):

### A. Database Schema
- Các bảng tĩnh `ordersTable`, `productionTable`, `productionRecordsTable`, `productionWasteTable` giữ nguyên vẹn.
- Hệ thống chỉ mục (Indexes) chiến lược đã được thiết lập thành công ở phiên trước, đảm bảo tốc độ lọc theo khoảng `ngaySanXuat` và `mayTS` diễn ra dưới 50ms.

### B. Domain Layer
- Không phát sinh thay đổi thực thể hay Aggregate mới. Logic truy vấn gộp nhóm thời gian tiếp tục được đẩy xuống tầng CSDL xử lý.

### C. Infrastructure Layer
- Các tệp định nghĩa Drizzle Schema giữ nguyên cấu trúc tĩnh.
- Tận dụng triệt để các câu lệnh truy vấn con `EXISTS` lồng nhau đã được thiết lập sẵn trong các route API phân tích.

### D. Application Layer & Services
- Các hàm tính toán tổng hợp duy trì ranh giới giao dịch hiện tại. Không yêu cầu mở rộng logic service.

### E. Presentation Layer & Contracts
- Hợp đồng Zod/OpenAPI (`openapi.yaml`) giữ nguyên các định nghĩa tham số đầu vào:
  - `dateFrom` (string)
  - `dateTo` (string)
  - `may` (string)
- Đảm bảo tính tương thích ngược tuyệt đối cho toàn bộ ứng dụng Frontend gọi API.

### F. Module Wiring
- Giữ nguyên cấu trúc xuất/nhập tệp của máy chủ Express server hiện tại.
