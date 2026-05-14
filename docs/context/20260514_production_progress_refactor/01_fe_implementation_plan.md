# Kế hoạch Kiến trúc Frontend — Production Progress Refactor

## A. Contract Sync (Đồng bộ Hợp đồng)
- **Cơ chế Kế thừa:** Frontend không can thiệp thủ công viết lại schema. Tận dụng cơ chế sinh tự động của Orval từ tệp `openapi.yaml` để cập nhật trực tiếp hai DTO:
  - `ProgressParentSummary`
  - `ProgressChildItem`
- Cấu trúc trả về sẽ tự động có sẵn trong gói `@workspace/api-client-react`.

## B. API Client Hooks (React Query Integration)
- **1. Hook danh sách cha (`useGetProgressParents`):**
  - **Query Key:** `['analytics', 'progress-parents', { page, limit, search }]`
  - Được tự động ánh xạ từ cấu hình Orval client. Trả về cấu trúc phân trang chuẩn xác kèm trường `total` phục vụ cho Pagination Footer.
- **2. Hook danh sách con (`useGetProgressItems`):**
  - **Query Key:** `['analytics', 'progress-items', lenhXK]`
  - Cấu hình tải lười thông qua cơ chế kích hoạt tùy chọn:
    ```typescript
    const { data: items } = useGetProgressItems(
      { lenhXK },
      { query: { enabled: expandedRows.includes(lenhXK) } }
    );
    ```

## C. Component Tree (Cấu trúc Cây Giao diện)
- Tái cấu trúc tệp `artifacts/production-dashboard/src/pages/production.tsx` áp dụng thiết kế Dual-Tab cao cấp.
- **Phân rã Component Layout:**
  - `ProductionPage`: Container gốc nạp dữ liệu định tuyến từ hook `useSearch({ from: '/san-xuat' })`. Trình bày thanh Toolbar phân vùng (Segmented Control Toolbar) với hiệu ứng trượt mượt mà.
  - `TabParentsView`: Khi tham số `tab === 'parents'`, hiển thị danh sách Lệnh XK cha dưới dạng Bảng cao cấp (Premium Table) tích hợp Expandable Row trỏ đến `LazyProgressChildRows` bên trong.
  - `TabItemsView`: Khi tham số `tab === 'items'`, nạp danh sách trực tiếp hiển thị giao diện phẳng (Flat Table) cho phép tra cứu, tìm kiếm sâu từng mã sợi độc lập với nhãn badge HSL dịu mắt (Soft Green, Soft Orange, Soft Gray).

## D. State Management (Quản lý Trạng thái & Ranh giới URL)
- **Domain Data:** Chuyển giao hoàn toàn cho React Query quản lý vòng đời và bộ nhớ đệm.
- **URL Search Params (Nguồn sự thật UI):** Thay thế toàn bộ cờ `isGrouped` và các bộ lọc ngầm bằng thuộc tính truy vấn định tuyến của `TanStack Router` (`tab`, `sortBy`, `sortOrder`, `statusFilter`, `searchQuery`, `page`). 
- **Đồng bộ Định tuyến (One-Way Data Flow):** Bất kỳ hành động chuyển tab hoặc chọn bộ lọc nào đều kích hoạt lệnh `navigate({ search: ... })`, tự động truyền xuống API Client mà không bị trễ đồng bộ do state trung gian.
