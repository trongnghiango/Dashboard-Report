# Phân tích UI/UX — Module Auth & RBAC

Tài liệu này phân tích cách tích hợp module Auth vào Frontend Dashboard-Report.

## 1. Mục tiêu UX
- **Login Experience:** Giao diện đăng nhập hiện đại, có phản hồi lỗi rõ ràng (Toast).
- **Session Persistence:** Tự động khôi phục phiên làm việc khi F5 (Hydration).
- **Access Control:** Người dùng không nhìn thấy các Menu hoặc Nút bấm mà họ không có quyền (Server-Driven UI).
- **Route Protection:** Chặn truy cập trực tiếp vào các trang nhạy cảm bằng URL.

## 2. Data Flow
- **Auth Store (Zustand):** Lưu trữ `user` và `abilities`.
- **API Client:** Sử dụng React Query để gọi `/api/auth/me`.
- **Logic Kiểm tra:** Component `Can` hoặc hook `useAuth().can(resource, action)`.

## 3. Server-Driven UI
Dựa trên kết quả trả về từ Backend (`00_be_analysis.md`), Frontend sẽ map `abilities` vào giao diện:
- `sidebar`: Chỉ hiện Menu các Resource có trong `abilities`.
- `buttons`: Chỉ hiện nút Action có trong danh sách hành động của Resource đó.

## 4. Danh sách Component dự kiến
- `LoginForm`: Form đăng nhập sử dụng `react-hook-form` + `zod`.
- `AuthProvider`: Bọc ứng dụng để quản lý trạng thái Auth toàn cục.
- `Can`: Wrapper component để bảo vệ các đoạn UI nhỏ.
  - Ví dụ: `<Can I="CREATE" a="orders">...</Can>`
