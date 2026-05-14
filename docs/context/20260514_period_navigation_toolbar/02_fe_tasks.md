# Checklist Thực thi Frontend - Bộ lọc Chu kỳ Thời gian

Dưới đây là trình tự thực thi mã nguồn chi tiết phía Frontend để tích hợp thanh công cụ điều hướng chu kỳ thời gian:

```markdown
- [x] 1. Verify Contracts: Kiểm tra lại các thuộc tính tham số `dateFrom`, `dateTo`, `may` từ lớp client sinh tự động của Orval.
- [x] 2. Create Global Persist Store (`src/stores/usePeriodStore.ts`):
  - Khai báo interface `PeriodState`.
  - Viết giải thuật nội suy khoảng ngày tự động dựa trên mốc chu kỳ (Day, Week, Month, Quarter, Year).
  - Bọc store qua middleware `persist` ghi xuống `localStorage`.
- [x] 3. Form/UI Components (`src/components/period-toolbar.tsx`):
  - Thiết kế thanh công cụ cố định (sticky) với phong cách Glassmorphism.
  - Tích hợp cụm Segmented Control chuyển đổi chế độ xem.
  - Hiển thị chuỗi ngày tháng động dễ đọc kèm khả năng nhấp chọn Custom Date Range.
  - Lập trình cặp phím `<` `>` điều hướng lùi/tiến chu kỳ liền kề.
- [x] 4. Page Mappings (`src/pages/dashboard.tsx` & `src/pages/performance.tsx`):
  - Chèn Component `PeriodToolbar` vào ngay dưới tiêu đề chính.
  - Trích xuất tham số `dateFrom`, `dateTo` từ Store và truyền vào các hook lấy dữ liệu của Orval.
  - Kiểm tra giao diện đáp ứng (Responsive) trên màn hình Desktop lẫn Mobile.
```
