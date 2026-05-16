# --- STAGE 1: Build ---
FROM node:22 AS builder

# Cài đặt pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy toàn bộ mã nguồn dự án
COPY . .

# Cài đặt dependencies (bỏ frozen-lockfile để tránh lỗi sai lệch môi trường)
# Thêm --no-verify-store-integrity để tăng tốc và tránh lỗi checksum
RUN pnpm install --no-frozen-lockfile

# Build Backend
WORKDIR /app/artifacts/api-server
RUN pnpm run build:prod

# --- STAGE 2: Runtime ---
# Sử dụng image slim để đảm bảo kích thước nhỏ và hiệu suất cao
FROM node:22-slim

WORKDIR /app

# Chỉ copy file bundle duy nhất và file .env (nếu có)
COPY --from=builder /app/artifacts/api-server/dist/index.mjs ./index.mjs

# Biến môi trường mặc định
ENV NODE_ENV=production
ENV API_PORT=3000

# Render sẽ tự động gán PORT qua biến môi trường, server của bạn đã sẵn sàng nhận
EXPOSE 3000

# Khởi chạy server trực tiếp bằng node (không qua npm/pnpm để đạt hiệu suất cao nhất)
CMD ["node", "index.mjs"]
