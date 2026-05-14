# Phân tích UI/UX & Kiến trúc Frontend — Production Progress Refactor

## 1. Mục tiêu Trải nghiệm Người dùng (UX Goals)
- **Chấm dứt mâu thuẫn Giao diện:** Đồng bộ hóa số liệu báo cáo dòng hiển thị ở Footer (Pagination) khớp tuyệt đối với số lượng Lệnh XK cha thực tế đang được nạp từ Backend.
- **Loại bỏ giật lag (Layout Thrashing):** Áp dụng phân trang triệt để cho danh sách Lệnh XK cha, giải quyết hoàn toàn tình trạng treo DOM do nhồi hàng ngàn thẻ `<TableRow>` cùng lúc (thanh cuộn dài vô tận).
- **Tương tác Tức thì (Instant Expansion):** Tải lười (Lazy Loading) mượt mà chi tiết các mã sợi con khi bấm nút mũi tên mở rộng. Tận dụng tối đa bộ nhớ đệm của React Query để hiển thị ngay lập tức nếu người dùng đóng/mở lại cùng một Lệnh XK.

## 2. Luồng Dữ liệu Dự kiến (Data Flow Mapping)
- **Nguồn Sự Thật (Source of Truth):** Frontend loại bỏ hoàn toàn việc định nghĩa các interface JS/TS tự do, chuyển sang kế thừa toàn bộ từ 2 Zod Schema hợp đồng (`ProgressParentSummarySchema` và `ProgressChildItemSchema`) được định nghĩa chia sẻ.
- **Tầng Giao tiếp API (Client Hooks):**
  - Hook `useProgressParents`: Tự động gửi request nạp trang mới khi các state bộ lọc (`page`, `limit`, `search`) thay đổi.
  - Hook `useProgressChildItems`: Bị khóa mặc định (`enabled: false`), chỉ kích hoạt tải mạng khi Lệnh XK tương ứng xuất hiện trong mảng state `expandedRows`.

## 3. Ranh giới Trạng thái & Server-Driven UI
- **Domain Data:** Toàn bộ dữ liệu tiến độ gom nhóm được chuyển giao cho `@tanstack/react-query` quản lý vòng đời và bộ nhớ đệm. Bỏ hoàn toàn lời gọi `fetch()` thô trong `React.useEffect`.
- **URL-Driven State (Contract-First):** Trạng thái hiển thị của trang được ánh xạ 100% vào Search Params của TanStack Router, bao gồm:
  - `tab`: `'parents' | 'items'` (Chuyển đổi 2 góc nhìn Master-Detail và Bảng phẳng tra cứu sợi).
  - `sortBy`: `'tienDo' | 'slDonHang' | 'daSanXuat'` và `sortOrder`: `'asc' | 'desc'`.
  - `statusFilter`: `'all' | 'completed' | 'running' | 'unstarted'`.
  - `searchQuery` và `page`.
- **Server-Driven UI & Premium Aesthetics:** 
  - Ứng dụng hệ thống màu sắc HSL dịu mắt cho các Status Badge (Soft Green, Soft Orange, Soft Gray) thay vì màu gốc chói lóa.
  - Sử dụng thanh Toolbar phong cách Segmented Control trượt êm ái, mang lại trải nghiệm UX đẳng cấp doanh nghiệp.
