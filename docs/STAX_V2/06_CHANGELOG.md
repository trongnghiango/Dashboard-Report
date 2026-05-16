# STAX V2 System Changelog

### [2026-05-16] - Frontend Auth Token Security Upgrade

- **Module:** `production-dashboard`, `api-client-react`
- **Thay đổi:**
  - `stores/auth.ts`: Thêm `accessToken` vào Zustand state. Token chỉ sống trong memory, không lưu localStorage (chống XSS).
  - `hooks/api/useAuth.ts`: Xóa `localStorage.setItem("auth_token", ...)`. Dùng flag `is_logged_in` thay thế. Gọi `setAuthTokenGetter()` để `customFetch` tự gắn Bearer token.
  - `custom-fetch.ts`: Thêm auto-refresh interceptor — khi nhận 401, tự gọi `POST /api/auth/refresh` (dùng HttpOnly Cookie) rồi retry request gốc.
  - `artifacts/api-server/scripts/create-user.ts`: Bổ sung script tạo tài khoản người dùng qua CLI.

### [2026-05-16] - Backend AT/RT Authentication System

- **Module:** `api-server`, `lib/db`, `lib/api-zod`
- **Thay đổi:**
  - `auth.ts` (schema): Thêm bảng `refresh_tokens`, hỗ trợ tối đa 5 phiên đồng thời với FIFO eviction.
  - `auth.contract.ts`: Đổi `token` → `accessToken`, thêm `refreshResponseSchema`.
  - `DrizzleRefreshToken.repository.ts`: Repository mới với Token Rotation và giới hạn 5 thiết bị.
  - `Auth.service.ts`: Thêm `login()`, `refresh()` (Token Rotation), `logout()`.
  - `Auth.controller.ts`: Login set HttpOnly Cookie, route `POST /refresh`, `POST /logout`.
  - `app.ts`: Đăng ký `cookie-parser` middleware.

### [2026-05-14] - Executive Dashboard: Cảnh báo Rủi ro Đơn hàng (Order Risk Forecast) & Thanh Điều hướng Thời gian (Period Toolbar)

- **Module:** `api-server`, `api-spec`, `production-dashboard`
- **Thay đổi:**
  - **Backend Server-Driven Engine:** Mở rộng hợp đồng API `GET /api/analytics/summary` trả về mảng `ordersAtRisk`. Viết giải thuật tự động đánh giá chênh lệch tỷ lệ hoàn thành thực tế so với tiến độ thời gian và kiểm soát trần phế liệu (3.5% / 5.0%) nhằm dán nhãn thông minh (`CRITICAL` | `WARNING` | `SAFE`) cùng lời khuyên can thiệp quản trị.
  - **Frontend Premium UI:** Triển khai khối giao diện cao cấp `OrderRiskBanner` hỗ trợ cơ chế **Thu gọn / Mở rộng (Collapsible UI)** linh hoạt giúp tiết kiệm không gian màn hình, căn giữa hoàn hảo theo trục dọc với biểu tượng nhấp nháy tĩnh.
  - **Thanh Công cụ Chu kỳ Thời gian:** Phát triển kho lưu trữ Zustand Persist Store (`usePeriodStore`) và `PeriodToolbar` hỗ trợ chuyển đổi linh hoạt các mốc Ngày/Tuần/Tháng/Quý/Năm với nhãn hiển thị tự nhiên trực quan.

### [2026-05-14] - Tối ưu hóa Trải nghiệm Lập trình viên (DX) Fallback Biến môi trường Frontend

- **Module:** `production-dashboard` (Cấu hình Vite - `vite.config.ts`)
- **Thay đổi:**
  - Loại bỏ cơ chế ném ngoại lệ (`throw Error`) mang tính cản trở khi khởi động ứng dụng thiếu cờ `PORT` và `BASE_PATH`.
  - Thiết lập giá trị mặc định thông minh: tự động gán `PORT=5173` và `BASE_PATH=/` giúp lập trình viên chạy lệnh khởi động `pnpm run dev` trơn tru mà không cần truyền tham số thủ công.

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
