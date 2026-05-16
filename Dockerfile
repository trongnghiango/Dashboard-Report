# --- STAGE 1: Build ---
FROM node:22-alpine AS builder

# Giới hạn RAM cho Node.js để build an toàn trên Render Free (512MB)
ENV NODE_OPTIONS="--max-old-space-size=400"

# Cài đặt pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy toàn bộ mã nguồn
COPY . .

# Cài đặt dependencies (bỏ qua scripts để tránh lỗi 'Use pnpm instead' do môi trường Docker)
RUN pnpm install --no-frozen-lockfile --aggregate-output --ignore-scripts

# Build Backend (Tạo ra file bundle siêu standalone)
WORKDIR /app/artifacts/api-server
RUN pnpm run build:prod

# --- STAGE 2: Runtime ---
# Sử dụng image alpine siêu nhẹ cho môi trường chạy
FROM node:22-alpine

WORKDIR /app

# CHỈ COPY FILE BUNDLE DUY NHẤT
# Vì chúng ta đã đóng gói tất cả vào 1 file, không cần node_modules nữa!
COPY --from=builder /app/artifacts/api-server/dist/index.mjs ./index.mjs

# Biến môi trường
ENV NODE_ENV=production
ENV API_PORT=3000

EXPOSE 3000

# Chạy trực tiếp từ file bundle
CMD ["node", "index.mjs"]
