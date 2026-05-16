# --- STAGE 1: Build ---
FROM node:22-slim AS builder

# Cài đặt pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy toàn bộ mã nguồn dự án (đã được lọc qua .dockerignore)
# .dockerignore sẽ giúp loại bỏ node_modules cục bộ để không làm nặng quá trình build
COPY . .

# Cài đặt dependencies cho toàn bộ workspace
# Chúng ta dùng --frozen-lockfile để đảm bảo tính nhất quán với pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

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
