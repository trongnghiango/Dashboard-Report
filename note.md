Bạn có thể tải toàn bộ dự án về máy tính theo các cách sau:

Cách 1: Tải file ZIP (đơn giản nhất)

Vào menu ⋮ (3 chấm) ở góc trên bên trái của Replit
Chọn "Download as zip"
Toàn bộ code sẽ được nén thành file .zip để tải về
Cách 2: Qua Git (dành cho developer)

Vào tab "Version Control" trong Replit
Kết nối với GitHub repository của bạn
Push code lên GitHub, sau đó clone về local bằng git clone
Sau khi tải về, để chạy local:

# Cài pnpm nếu chưa có
npm install -g pnpm
# Cài dependencies
pnpm install
# Cần tạo file .env với biến môi trường
DATABASE_URL=<postgres connection string>
SESSION_SECRET=<random string>
# Chạy API server
pnpm --filter @workspace/api-server run dev
# Chạy frontend (terminal khác)
pnpm --filter @workspace/production-dashboard run dev

Bạn sẽ cần chuẩn bị một PostgreSQL database ở local (hoặc dùng Docker: docker run -p 5432:5432 -e POSTGRES_PASSWORD=password postgres), sau đó chạy pnpm --filter @workspace/db run push để tạo schema.