# Dashboard-Report Monorepo

Dự án Dashboard-Report được tổ chức dưới dạng Monorepo sử dụng `pnpm`. Hệ thống bao gồm Backend (Express), Frontend (Vite/React) và các thư viện dùng chung.

## 🚀 Bắt đầu nhanh (Development)

### 1. Yêu cầu hệ thống
- **Node.js**: v20+ 
- **pnpm**: v9+
- **PostgreSQL**: Một instance database (Neon, Supabase hoặc Local).

### 2. Cài đặt Dependency
Chạy lệnh sau tại thư mục gốc:
```bash
pnpm install
```

### 3. Cấu hình Biến môi trường
Tạo file `.env` tại thư mục gốc (nếu chưa có) và cấu hình các thông số sau:

```env
# === BACKEND CONFIG ===
API_PORT=3000
DATABASE_URL="your_postgresql_url"
SESSION_SECRET="your_random_secret"

# === FRONTEND CONFIG ===
VITE_PORT=5173
VITE_API_URL=http://localhost:3000
```

### 4. Thiết lập Database
Đẩy cấu trúc bảng (schema) vào database của bạn:
```bash
pnpm --filter @workspace/db run push
```

### 5. Khởi chạy môi trường Dev
Bạn cần chạy cả Backend và Frontend đồng thời.

- **Chạy Backend**:
  ```bash
  pnpm --filter @workspace/api-server run dev
  ```
- **Chạy Frontend**:
  ```bash
  pnpm --filter @workspace/production-dashboard run dev
  ```

---

## 🏗️ Triển khai Production

### 1. Build toàn bộ dự án
Lệnh này sẽ thực hiện kiểm tra kiểu (typecheck) và build tất cả các gói:
```bash
pnpm run build
```

### 2. Chạy Backend
Backend sau khi build sẽ nằm trong thư mục `artifacts/api-server/dist`.
```bash
pnpm --filter @workspace/api-server run start
```

### 3. Triển khai Frontend
Frontend sau khi build sẽ nằm trong thư mục `artifacts/production-dashboard/dist/public`.
- Bạn có thể sử dụng một server tĩnh (như Nginx, Vercel, Netlify) để phục vụ thư mục này.
- Hoặc dùng lệnh preview để kiểm tra:
  ```bash
  pnpm --filter @workspace/production-dashboard run serve
  ```

---

## 📂 Cấu trúc thư mục
- `/artifacts`: Chứa các ứng dụng thực thi (Apps).
  - `api-server`: Hệ thống Backend.
  - `production-dashboard`: Giao diện Dashboard.
- `/lib`: Chứa các thư viện dùng chung (Packages).
  - `db`: Cấu hình Drizzle ORM và Schema.
  - `api-zod`: Định nghĩa Contract dữ liệu.
  - `api-client-react`: React Query hooks cho Frontend.

---

## 🛠️ Lưu ý về Biến môi trường
- Các biến dành cho Frontend **BẮT BUỘC** phải có tiền tố `VITE_`.
- Các biến dành cho Backend nên sử dụng tiền tố `API_` để dễ phân biệt.
- File `.env` tại root được chia sẻ cho cả workspace thông qua cấu hình `envDir` trong Vite và tham số `--env-file` trong Node.js.
