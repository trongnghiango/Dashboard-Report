# --- STAGE 1: Build ---
FROM node:22-alpine AS builder

# Giới hạn RAM cho Node.js để không vượt quá 512MB của Render Free
ENV NODE_OPTIONS="--max-old-space-size=400"

# Cài đặt pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy mã nguồn
COPY . .

# Cài đặt với các cờ tiết kiệm tài nguyên
RUN pnpm install --no-frozen-lockfile --aggregate-output

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
