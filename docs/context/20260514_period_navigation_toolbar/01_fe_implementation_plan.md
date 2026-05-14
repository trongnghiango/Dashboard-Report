# Kế hoạch Kiến trúc Chi tiết Frontend - Bộ lọc Chu kỳ Thời gian

Dựa trên tài liệu phân tích hệ thống, dưới đây là kế hoạch chi tiết triển khai cụm tính năng trên Frontend:

### A. Contract Sync (Đồng bộ Hợp đồng Dữ liệu)
- Không yêu cầu thay đổi hợp đồng API. Frontend tiếp tục khai thác các tham số tĩnh sinh tự động từ Orval:
  - `dateFrom`: Ngày bắt đầu chu kỳ (YYYY-MM-DD).
  - `dateTo`: Ngày kết thúc chu kỳ (YYYY-MM-DD).
  - `may`: Tên máy tạo sợi (Tùy chọn lọc).

### B. API Client (Orval Hooks)
- Cập nhật các trang `dashboard.tsx` và `performance.tsx` để đọc chuỗi ngày động từ Global Store, tiêm vào các hook:
  - `useGetSummary({ dateFrom, dateTo, may })`
  - `useGetOutputTrend({ dateFrom, dateTo, may })`
  - `useGetWasteBreakdown({ dateFrom, dateTo, may })`
  - `useGetShiftPerformance({ dateFrom, dateTo, may })`
  - `useGetOrderCompletion({ dateFrom, dateTo, may })`

### C. Component Tree & UI Design
- **[NEW] `src/stores/usePeriodStore.ts`:** Nơi định nghĩa Global Zustand Store kèm middleware `persist` lưu dữ liệu xuống `localStorage`. Tích hợp sẵn các hàm tính toán ngày tự động bằng đối tượng `Date` gốc của JavaScript (hoặc hàm hỗ trợ định dạng ISO) cho các chế độ Ngày, Tuần, Tháng, Quý, Năm.
- **[NEW] `src/components/period-toolbar.tsx`:** Thanh công cụ điều hướng cao cấp (Sticky Glassmorphism) chứa:
  1. *Segmented Control:* Dải nút bấm (Ngày | Tuần | Tháng | Quý | Năm).
  2. *Dynamic Date Label:* Hiển thị chuỗi nhãn tự nhiên (Ví dụ: "Quý 2, 2026") kèm dải ngày tĩnh bên dưới.
  3. *Step Navigation:* Các phím mũi tên `<` `>` dịch chuyển lùi/tiến chu kỳ liền kề.
- **[MODIFY] `src/pages/dashboard.tsx` & `src/pages/performance.tsx`:** Tích hợp Component `PeriodToolbar` vào ngay phía dưới tiêu đề trang, kết nối dữ liệu từ Store xuống các API hooks.

### D. State Management Architecture
- **Zustand Slice Shape:**
  ```typescript
  export type ViewMode = 'day' | 'week' | 'month' | 'quarter' | 'year';
  export interface PeriodState {
    viewMode: ViewMode;
    dateFrom: string;
    dateTo: string;
    setViewMode: (mode: ViewMode) => void;
    setDateRange: (from: string, to: string) => void;
    shiftPeriod: (direction: 'prev' | 'next') => void;
  }
  ```
- **Middleware:** Sử dụng `persist(..., { name: 'stax-dashboard-period-store' })`.
