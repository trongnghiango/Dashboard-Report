# STAX V2 System Changelog

### [2026-05-14] - Tối ưu hóa Database Schema với các Chỉ mục (Indexes) chiến lược

- **Module:** `@workspace/db` (Schema Sản xuất - `production.ts`)
- **Thay đổi:**
  - Bổ sung `index` cho cột `maSoi` trong bảng `ordersTable`.
  - Tích hợp cụm `index` cốt lõi cho các trường `ngaySanXuat`, `orderId`, và `maSoi` trên bảng `productionTable` nhằm tăng tốc bộ lọc khoảng thời gian và gom nhóm dữ liệu sợi.
  - Khởi tạo mới các `index` trên cặp cột `(orderId, ngaySanXuat)` cho hai bảng chi tiết `productionRecordsTable` và `productionWasteTable` để triệt tiêu độ trễ khi thực thi các lệnh `JOIN` tính toán tổng hợp ca và phế liệu.

### [2026-05-14] - Bổ sung Biểu đồ Mạng nhện (Radar Chart) phân tích cân bằng OEE

- **Module:** `production-dashboard` (Trang Hiệu suất - OEE)
- **Thay đổi:**
  - Import và cấu hình các thành phần đồ thị trực quan `RadarChart`, `Radar`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis` từ thư viện `recharts`.
  - Khai báo cấu trúc mảng `radarData` phản ánh tương quan 4 trục hiệu suất cốt lõi: Độ Khả dụng (A), Hiệu suất (P), Chất lượng (Q) và OEE Tổng thể.
  - Tái cấu trúc bố cục đơn lẻ thành Grid Layout 2 cột hiện đại, đặt biểu đồ Radar song song với biểu đồ cột kèm chú thích chi tiết, mang lại trải nghiệm thị giác (WOW feel) cao cấp.
