# Hướng dẫn Deployment - STAX Production Dashboard

Tài liệu này hướng dẫn cách triển khai (deploy) ứng dụng Frontend lên các môi trường Production (Netlify, Vercel, hoặc Server tĩnh).

## 1. Cấu hình Biến môi trường (Environment Variables)

Trước khi build, bạn cần thiết lập các biến sau (thường thiết lập trong Dashboard của nhà cung cấp Hosting):

| Biến | Ý nghĩa | Ví dụ |
|---|---|---|
| `VITE_API_URL` | Địa chỉ Backend API | `https://api.yourdomain.com` |
| `VITE_BASE_PATH` | Đường dẫn gốc ứng dụng | `/` |
| `NODE_ENV` | Chế độ môi trường | `production` |

---

## 2. Triển khai trên Netlify (Khuyến nghị)

Dự án đã có sẵn file `netlify.toml` để tự động hóa cấu hình.

**Cấu hình trên Netlify Dashboard:**
- **Build command:** `pnpm build`
- **Publish directory:** `artifacts/production-dashboard/dist/public`
- **Functions directory:** (Để trống)

**Tính năng đã tối ưu:**
- Tự động xử lý SPA Routing (Redirect tất cả về `index.html`).
- Tối ưu hóa bộ nhớ đệm (Caching) cho các file tĩnh.

---

## 3. Triển khai trên Server tĩnh (Nginx/Apache)

Nếu bạn muốn deploy thủ công trên server riêng:

### Bước 1: Build máy cục bộ
```bash
pnpm --filter @workspace/production-dashboard run build
```

### Bước 2: Copy file
Copy toàn bộ nội dung trong thư mục `artifacts/production-dashboard/dist/public` lên thư mục root của web server.

### Bước 3: Cấu hình Nginx (Quan trọng)
Để SPA hoạt động đúng, cần thêm cấu hình `try_files` vào block server:

```nginx
location / {
    root /var/www/your-app;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

---

## 4. Các tối ưu hóa đã thực hiện (Build Performance)

Bản build đã được tối ưu hóa sâu:
- **Code Splitting:** Tách rời thư viện `xlsx` và `recharts`. Chúng chỉ được tải khi người dùng truy cập trang tương ứng.
- **Manual Chunks:** Gom nhóm React và Framework vào `framework-vendor` để tối ưu hóa tốc độ tải và Cache trình duyệt.
- **Tree Shaking:** Loại bỏ hoàn toàn mã nguồn dư thừa từ các thư viện UI.

---

## 5. Lưu ý bảo mật
- Tuyệt đối không đưa các thông tin nhạy cảm (DB Password, Secret Key) vào biến môi trường `VITE_`. Chỉ các biến cần thiết cho trình duyệt mới được bắt đầu bằng tiền tố này.
- Đảm bảo Backend đã được cấu hình **CORS** để cho phép Domain của Frontend truy cập.
