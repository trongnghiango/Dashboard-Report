# Phân tích Giao diện UI/UX & Kiến trúc Frontend - Bộ lọc Chu kỳ Thời gian

Dựa trên Quyết định Kiến trúc từ luồng `@stax-think` (Hybrid Premium Toolbar), dưới đây là tài liệu phân tích hệ thống Frontend:

### 1. Mục tiêu UX (UX Goals)
- **Cân bằng Hoàn hảo:** Tích hợp thanh Toolbar sang trọng ngay phía trên các trang Dashboard và Hiệu suất (OEE). Cung cấp dải tab chọn nhanh (Segmented Control) cho các mốc: `Ngày` | `Tuần` | `Tháng` | `Quý` | `Năm`.
- **Minh bạch Dải ngày:** Ở giữa thanh công cụ hiển thị rõ nhãn chu kỳ động (Ví dụ: "Quý 2, 2026") kèm dải ngày thực tế (`dateFrom` - `dateTo`). Hỗ trợ nhấp vào để mở dải chọn ngày tùy chọn (Custom Date Range).
- **Bộ nhớ Thông minh (Persistence):** Tự động khôi phục chế độ xem cuối cùng của người dùng qua `localStorage`, giúp giao diện giữ nguyên ngữ cảnh phân tích sau khi tải lại trang.

### 2. Ranh giới Trạng thái (State Boundaries)
- **Zustand Persist Store:** Quản lý trạng thái bộ lọc chu kỳ (`viewMode`, `dateFrom`, `dateTo`) dưới dạng Global Context tĩnh. Không lưu trữ mảng dữ liệu API vào Zustand.
- **Orval API Hooks (React Query):** Dữ liệu trả về từ các API phân tích được quản lý, đệm (caching) và tự động nạp lại bởi lớp hook sinh tự động (Ví dụ: `useGetSummary`, `useGetOutputTrend`). Mỗi khi Zustand Store thay đổi dải ngày, hook tự động gọi lại API cực kỳ mượt mà.

### 3. Logic Server-Driven UI
- Các trang báo cáo hiển thị số liệu phân tích dạng mảng tĩnh và đồ thị Recharts. Trạng thái các nút chọn chu kỳ được xác định thuần túy phía client dựa trên thuộc tính `viewMode` hiện tại của Store.
