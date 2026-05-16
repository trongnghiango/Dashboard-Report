# Hướng dẫn triển khai STAX Backend lên Render (Docker)

Tài liệu này hướng dẫn chi tiết cách deploy Backend của bạn lên Render bằng Docker để đạt được hiệu suất và độ ổn định cao nhất.

## 1. Chuẩn bị trước khi Deploy
- Đảm bảo bạn đã push code mới nhất lên GitHub/GitLab (bao gồm cả file `Dockerfile` và `.dockerignore` ở thư mục gốc).
- Đã có sẵn một database PostgreSQL (Render cũng cung cấp dịch vụ này hoặc bạn có thể dùng dịch vụ bên ngoài).

## 2. Các bước thiết lập trên Render

### Bước 2.1: Tạo Web Service mới
1. Truy cập vào [Dashboard của Render](https://dashboard.render.com/).
2. Nhấn nút **New +** và chọn **Web Service**.
3. Kết nối với repository GitHub của bạn.

### Bước 2.2: Cấu hình Web Service
Trong trang thiết lập, hãy điền các thông tin sau:

- **Name:** `stax-api` (hoặc tên bất kỳ bạn muốn).
- **Region:** Chọn khu vực gần người dùng của bạn nhất (ví dụ: `Singapore` cho người dùng Việt Nam).
- **Branch:** `main` (hoặc branch chính của bạn).
- **Runtime:** CHỌN **Docker**.

### Bước 2.3: Thiết lập Nâng cao (Advanced)
Nhấn vào nút **Advanced** để cấu hình thêm:

1. **Docker Context:** `.` (Dấu chấm - nghĩa là thư mục gốc của repo).
2. **Dockerfile Path:** `./Dockerfile`.
3. **Environment Variables:** Nhấn **Add Environment Variable** cho các biến sau:
    - `DATABASE_URL`: Đường dẫn kết nối database (BẮT BUỘC).
    - `API_PORT`: `3000` (Backend của chúng ta mặc định chạy cổng này).
    - `NODE_ENV`: `production`.
    - `LOG_LEVEL`: `info`.

### Bước 2.4: Health Check (Quan trọng)
Render cần biết server của bạn đã khởi động thành công hay chưa.
- **Health Check Path:** Điền `/api/health` (Hoặc bất kỳ route nào trả về status 200 đơn giản trong code của bạn). Nếu chưa có route này, bạn có thể tạm để trống, Render sẽ kiểm tra việc mở cổng (port).

## 3. Theo dõi quá trình Build
- Render sẽ bắt đầu chạy lệnh trong `Dockerfile`.
- **Giai đoạn 1 (Builder):** Sẽ mất khoảng 1-2 phút để cài đặt `pnpm` và build code.
- **Giai đoạn 2 (Runtime):** Render sẽ copy file `index.mjs` sang image mới và khởi chạy.

## 4. Kiểm tra sau khi Deploy
Sau khi Render báo **"Live"**, bạn có thể truy cập vào URL mà Render cung cấp (ví dụ: `https://stax-api.onrender.com/api/...`) để kiểm tra.

## 5. Xử lý sự cố thường gặp
- **Lỗi "Port already in use" hoặc "Connection refused":** Đảm bảo bạn đã đặt `API_PORT` trong Environment Variables trùng với cổng mà Render mong đợi (mặc định Render thường map cổng 10000 hoặc 3000).
- **Lỗi Database Connection:** Kiểm tra xem Database của bạn có cho phép IP của Render truy cập hay không (nên dùng chuỗi kết nối công khai).

---
*Chúc bạn triển khai thành công! Nếu có lỗi log từ Render, hãy gửi cho tôi để được hỗ trợ.*
