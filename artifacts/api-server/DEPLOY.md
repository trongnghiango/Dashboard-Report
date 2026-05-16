# Hướng dẫn Deployment - STAX API Server

Tài liệu này hướng dẫn cách triển khai Backend (Express server) lên môi trường Production.

## 1. Cấu hình Biến môi trường (Environment Variables)

Cần thiết lập các biến môi trường sau (thường nằm trong file `.env` hoặc cấu hình của Server):

| Biến | Ý nghĩa | Ví dụ |
|---|---|---|
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL | `postgres://user:pass@host:5432/db` |
| `API_PORT` | Cổng chạy Server | `3000` |
| `NODE_ENV` | Chế độ chạy | `production` |
| `LOG_LEVEL` | Mức độ Logging | `info` |

---

## 2. Quy trình Build Production

Để đạt hiệu suất cao nhất và kích thước nhỏ nhất, sử dụng lệnh build chuyên dụng:

```bash
pnpm --filter @workspace/api-server run build:prod
```

Lệnh này sẽ tạo ra file **`dist/index.mjs`** duy nhất chứa toàn bộ code và thư viện đã được nén (minify) và tối ưu hóa.

---

## 3. Các phương thức triển khai

### Cách 1: Sử dụng PM2 (Khuyến nghị cho VPS)
PM2 giúp quản lý tiến trình, tự động restart nếu crash và hỗ trợ Cluster mode.

```bash
# Cài đặt PM2 nếu chưa có
npm install -g pm2

# Khởi chạy server
pm2 start artifacts/api-server/dist/index.mjs --name stax-api
```

### Cách 2: Sử dụng Docker (Tối ưu nhất cho Size & Security)
Sử dụng Multi-stage build để tạo Image cực nhẹ (~100MB).

**Dockerfile mẫu:**
```dockerfile
FROM node:22-slim AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install
RUN pnpm --filter @workspace/api-server build:prod

FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=builder /app/artifacts/api-server/dist/index.mjs .
EXPOSE 3000
CMD ["index.mjs"]
```

---

## 4. Đặc điểm của bản Build Production

Bản build `production` khác biệt hoàn toàn so với bản `dev`:
- **Code Minification:** Đã được nén và tree-shaking để loại bỏ code thừa.
- **Performance Logging:** Tắt `pino-pretty`, log sẽ xuất ra định dạng JSON chuẩn (tốc độ xử lý nhanh hơn 2-3 lần).
- **Clean Code:** Xóa bỏ toàn bộ các lệnh `console.log` và `debugger`.
- **Modern Syntax:** Sử dụng chuẩn ESNext (Node22) để tận dụng các tối ưu hóa mới nhất của V8 Engine.

---

## 5. Lưu ý quan trọng
- **Database Pooling:** Hệ thống đã được cấu hình sẵn Connection Pooling thông qua `pg.Pool`.
- **CORS:** Đảm bảo cấu hình đúng danh sách trắng (whitelist) các domain Frontend trong file `app.ts` nếu cần thiết.
- **Migration:** Đảm bảo đã chạy các bản migration database trước khi khởi động server mới.
