# Checklist Thực thi Backend — Production Progress Refactor

Trình tự BẮT BUỘC triển khai cho Backend:

```markdown
[x] 1. Shared Contracts (Cập nhật OpenAPI định nghĩa đường dẫn và DTO tại lib/api-spec/openapi.yaml để sinh Zod tự động)
[x] 2. Database Schema (Bổ sung B-Tree Index cho donHang, lenhXK tại lib/db/src/schema/production.ts)
[x] 3. pgEnum definitions (Tận dụng enum trạng thái hiện có hoặc ánh xạ động)
[x] 4. Run migration (Chạy pnpm --filter @workspace/db run generate để tạo tệp migration Drizzle)
[x] 5. Domain Entity + Props interface (Định nghĩa Interface giao tiếp ProgressParentSummary và ProgressChildItem)
[x] 6. Value Objects (nếu có - Bỏ qua do đây là lớp Read Model)
[x] 7. Repository Interface (Port + DI Token - Khai báo logic gom nhóm cấp thấp)
[x] 8. Domain Events (nếu có - Bỏ qua)
[x] 9. Mapper (toDomain + toPersistence - Trực tiếp ánh xạ SQL select shape sang JSON object)
[x] 10. Repository Implementation (DrizzleXxxRepository - Thực thi giải thuật Cascade Cap Fill rót đầy có trần tuần tự)
[x] 11. Application Service (Cấu trúc logic xử lý chia cho 0 và phân trang cấp cao)
[x] 12. Request/Response DTOs (Kiểm chứng tự động qua Middleware Zod sinh từ Orval)
[x] 13. Controller (Định tuyến Express router.get cập nhật thuật toán Cascade Cap Fill tại tệp routes/production.ts)
[x] 14. Module Wiring + index.ts export (Gắn kết hoàn chỉnh vào luồng API chính)
[x] 15. Unit Test (Service — mock repositories - Xác minh tỷ lệ % xử lý đúng ngoại lệ)
[x] 16. Integration Test (Repository — PGLite - Seed dữ liệu trùng lặp và xác minh không bị Cartesian Product)
[x] 17. npm run build — 0 TypeScript error (Chạy kiểm tra toàn bộ workspace sau khi áp dụng Cascade)
[x] 18. Manual API test via Swagger (Kiểm thử thực tế xác minh các thanh tiến độ đầy đều đặn)
```
