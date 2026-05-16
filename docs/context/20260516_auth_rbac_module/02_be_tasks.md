# Checklist Thực thi: AT/RT Authentication System

[ ] 1. Cập nhật Shared Contracts (`lib/api-zod/src/auth.contract.ts`) — Thêm Refresh Token schemas.
[ ] 2. Cập nhật Database Schema (`lib/db/src/schema/auth.ts`) — Thêm `refreshTokensTable`.
[ ] 3. Chạy Migration (`npx pnpm --filter @workspace/db run push`).
[ ] 4. Tạo Repository Port: `IRefreshTokenRepository` (Symbol + Interface).
[ ] 5. Triển khai `DrizzleRefreshTokenRepository`.
[ ] 6. Cập nhật `AuthService.login()`:
    - Thêm logic tạo Refresh Token.
    - Thêm logic kiểm tra giới hạn 5 thiết bị (FIFO).
    - Lưu vào Database.
[ ] 7. Thêm phương thức `AuthService.refresh()`:
    - Kiểm tra tính hợp lệ của Token trong DB.
    - Thực hiện Token Rotation.
[ ] 8. Cập nhật `Auth.controller.ts`:
    - Inject `cookie-parser` middleware vào server (nếu chưa có).
    - Cập nhật `/login` để set HttpOnly Cookie.
    - Thêm route `POST /refresh` để xử lý cấp lại token.
    - Thêm route `POST /logout` để xóa token trong DB và Cookie.
[ ] 9. Cập nhật `Auth.middleware.ts` để kiểm tra Access Token ngắn hạn.
[ ] 10. `npm run build` tại `@workspace/api-server` để đảm bảo 0 lỗi TypeScript.
[ ] 11. Kiểm tra thủ công bằng `curl` hoặc Postman.
