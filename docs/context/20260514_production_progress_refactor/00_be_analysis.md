# Phân tích Nghiệp vụ & Kiến trúc Backend — Production Progress Refactor

## A. Phân loại module
- **Phân loại Tier:** Module Báo cáo Tiến độ Sản xuất (Production Progress) thuộc **Tier 3 — Process Flow / Analytics**.
- **Lý do:** Đây là module theo dõi dòng chảy vận hành và kết xuất báo cáo dựa trên các thực thể cốt lõi đã hình thành từ các đợt import dữ liệu (Orders, Production records). Nó không phải là nền tảng hệ thống (Tier 1) hay DNA cốt lõi độc lập (Tier 2).
- **Phụ thuộc:** Phụ thuộc trực tiếp vào các định nghĩa cấu trúc dữ liệu của `ordersTable` và `productionTable`.

## B. Bounded Context & Ubiquitous Language
- **Domain:** Quản lý và theo dõi tiến độ thực hiện các Lệnh Xuất Khẩu (Production Execution & Progress Tracking).
- **Bảng đối trọng thuật ngữ (Ubiquitous Language):**

| Tên Nghiệp vụ (Business Term) | Tên Kỹ thuật trong Code (Technical Term) | Ý nghĩa & Vai trò |
| :--- | :--- | :--- |
| **Lệnh Xuất Khẩu (Lệnh XK)** | `lenhXK` | Định danh cấp cao nhất của đợt sản xuất/giao hàng. |
| **Đơn Hàng** | `donHang` | Mã đơn đặt hàng cụ thể (trong DB `orders.donHang` lưu mã Lệnh XK). |
| **Mã Sợi** | `maSoi` | Mã loại sợi được sản xuất (định danh con chi tiết). |
| **Sản Lượng Đơn Hàng** | `slDonHang` | Chỉ tiêu kế hoạch ban đầu cần hoàn thành. |
| **Đã Sản Xuất** | `daSanXuat` / `tongSLNgay` | Khối lượng thành phẩm thực tế làm ra được cộng dồn theo ngày. |
| **Tiến Độ Hoàn Thành** | `tienDo` | Tỷ lệ phần trăm giữa Đã Sản Xuất và Sản Lượng Đơn Hàng. |

## C. Data Flow & API Design
- **Luồng dữ liệu tối ưu hóa (Optimized Data Flow):**
  `Client` $\rightarrow$ `Express Router` $\rightarrow$ `Drizzle SQL Aggregation` $\rightarrow$ `PostgreSQL Engine` $\rightarrow$ `DTO Mapping` $\rightarrow$ `Client`
- **Các API Endpoints thiết lập mới:**
  1. **`GET /api/analytics/progress-parents`**
     - **Mục đích:** Trả về danh sách Lệnh XK cha đã gom nhóm tổng sản lượng bằng SQL `GROUP BY`, hỗ trợ phân trang chuẩn.
     - **Query Params:** `page`, `limit`, `search`.
  2. **`GET /api/analytics/progress-items`**
     - **Mục đích:** Phục vụ cơ chế tải lười (Lazy loading), lấy chi tiết danh sách mã sợi thuộc một Lệnh XK cụ thể. Áp dụng chiến lược **Cascade Cap Fill (Rót đầy tuần tự có trần)**: Rót sản lượng chung của mã sợi cho từng đơn con tối đa đến mức cam kết của nó, phần dư được tự động chuyển tiếp sang rót cho các đơn con tiếp theo để đảm bảo tiến độ hiển thị tuần tự, trực quan và công bằng.
     - **Query Params:** `lenhXK` (bắt buộc).

## D. Cross-module dependencies
- **Giao tiếp:** Do kiến trúc hiện tại của service là Express nguyên khối truy vấn trực tiếp DB thông qua Drizzle, luồng dữ liệu tương tác thẳng với các bảng thuộc domain DB (`@workspace/db`).
- **Domain Event:** Tạm thời luồng truy vấn báo cáo (Read-only) không kích hoạt phát Domain Event làm thay đổi trạng thái hệ thống.

## E. Multi-tenancy
- **Hiện trạng:** Bảng `production` và `orders` hiện tại phục vụ đơn xưởng (Single Tenant) cho nhà máy sản xuất sợi, chưa áp dụng cơ chế cô lập theo `organizationId`.
- **Định hướng mở rộng:** Cấu trúc DTO hợp đồng chia sẻ được chuẩn bị sẵn sàng để bổ sung thuộc tính lọc tenant khi scale lên các chi nhánh/phân xưởng độc lập.

## F. Security & Server-Driven UI (`_actions`)
- **Cơ chế quyền truy cập:** Endpoint chỉ cho phép các tài khoản thuộc nhóm Quản đốc, Ban giám đốc hoặc Kế toán sản xuất truy vấn.
- **Server-Driven UI:** DTO trả về thuộc tính `status` (`IN_PROGRESS` / `COMPLETED`) làm căn cứ để Frontend hiển thị nhãn trạng thái và cho phép thực hiện các thao tác xuất báo cáo tương ứng.
