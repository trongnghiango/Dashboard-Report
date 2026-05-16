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



# NHIỆM VỤ: KHỞI TẠO DỰ ÁN STAX STANDALONE TEMPLATE BẰNG BUN

Bạn là một chuyên gia kiến trúc phần mềm. Nhiệm vụ của bạn là scaffold (khởi tạo) một dự án mẫu B2B SaaS độc lập, chạy trên Bun, áp dụng chặt chẽ mô hình Clean Architecture và DDD.

### 1. Tổng quan & Quyết định Kiến trúc
*   **Môi trường**: **Bun** (Sử dụng `bun init`, `bun install`, `bun run`).
*   **Mô hình**: **Monorepo** với cơ chế **Single Process** (Vite Middleware).
*   **Cách thức vận hành**:
    *   Chỉ dùng **1 cổng (Port)** duy nhất cho cả Frontend và Backend.
    *   Ở chế độ Dev (`bun run dev`), Server (Hono) sẽ khởi tạo và nhúng Vite vào làm middleware để phục vụ giao diện (React) và HMR. Các request bắt đầu bằng `/api/*` sẽ do API Router xử lý.
    *   Ở chế độ Production, Server sẽ serve thư mục `dist` của Frontend.
*   **Tech Stack Cốt lõi**:
    *   **Frontend**: React + Vite + TanStack Router + TailwindCSS + TanStack Query.
    *   **Shared**: Zod (Định nghĩa API Contracts - Nguồn sự thật duy nhất).
    *   **Backend**: Hono (chạy trên Bun) + Drizzle ORM (Postgres) + Awilix (Dependency Injection).

### 2. Cấu trúc Thư mục Yêu cầu
Hãy tạo chính xác cấu trúc workspace sau:
```text
stax-standalone-template/
├── package.json                 # Root (Định nghĩa Bun workspaces)
├── client/                      # 🌐 FRONTEND
├── shared/                      # 🤝 SHARED CONTRACTS
└── server/                      # 🛡️ BACKEND
    └── src/
        ├── index.ts             # Khởi chạy Hono, cấu hình Vite Middleware, Mount Routers
        ├── core/                # Core Hệ thống
        │   ├── di/              # 💉 Setup Awilix Container (nơi duy nhất đăng ký DI)
        │   └── middlewares/     # Hono middlewares (Error, Auth)
        └── modules/             # Chứa các Business Modules (không phụ thuộc chéo)
            ├── tier1_foundation/
            ├── tier2_domain_core/
            │   └── user/        # MODULE MẪU (BẮT BUỘC CHIA 4 LỚP BÊN DƯỚI)
            │       ├── domain/      # 🟢 Entities, Exceptions, Interfaces (Ports)
            │       ├── application/ # 🟢 Use Cases, Services
            │       ├── infra/       # 🔴 Drizzle Repositories (Adapters)
            │       └── presentation/# 🔵 Hono Controllers, Routers
            └── tier3_process/
```

### 3. Quy Tắc Kỹ Thuật Bắt Buộc Đối Với Backend (Clean Architecture)
*   **Tính Tinh Khiết Cực Đoan**: Hai lớp `domain` và `application` chỉ được phép chứa TypeScript thuần và các thư viện utils cơ bản (như lodash). **TUYỆT ĐỐI KHÔNG IMPORT** Hono, Drizzle, Awilix, hay sử dụng bất kỳ `@Decorator` nào vào 2 lớp này.
*   **Port & Adapter**: Giao tiếp với DB phải thông qua Interface (Port) định nghĩa ở tầng `domain`. Tầng `infra` sẽ viết class implement interface đó (Adapter).
*   **Luật Phụ Thuộc (Dependency Rule)**: `Presentation` → `Application` → `Domain` ← `Infrastructure`. Hạ tầng và Giao diện hướng vào Core.
*   **Dependency Injection (Awilix)**: Dùng Classic Constructor Injection. Service và Controller chỉ cần khai báo dependency ở tham số `constructor`. Việc nối ghép (Bind Interface với Implementation) thực hiện hoàn toàn tại thư mục `core/di/`.

### 4. Hành động ngay bây giờ:
1. Tạo root `package.json` với `workspaces: ["client", "server", "shared"]`.
2. Tạo các file cơ bản để chạy được cơ chế **Vite Middleware + Hono**.
3. Viết code hoàn chỉnh cho một module mẫu là `user` tuân thủ nghiêm ngặt chuẩn 4 lớp và được inject qua Awilix để làm ví dụ minh họa cho bộ template.
```

---
> Phiên thiết kế kiến trúc `@stax-think` đến đây là hoàn tất mọi mục tiêu! Bạn cứ copy block nội dung Prompt phía trên đưa cho Replit AI là hệ thống sẽ tạo ra một khung xương sắc bén và chuẩn mực đúng như chúng ta đã định hình. Chúc bạn ra mắt Template xuất sắc nhé!