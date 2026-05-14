# Checklist Thực thi Backend - Cảnh báo Sớm & Quản trị Rủi ro Đơn hàng

Trình tự BẮT BUỘC:

```markdown
- [x] 1. Cập nhật OpenAPI: Bổ sung đối tượng `OrderRiskForecast` và mảng `ordersAtRisk` vào endpoint `/analytics/summary` tại `lib/api-spec/openapi.yaml`.
- [x] 2. Codegen Zod Contracts: Chạy lệnh `pnpm --filter @workspace/api-spec run codegen` để đồng bộ lại các file hợp đồng chia sẻ.
- [x] 3. Mở rộng Drizzle Subquery: Cập nhật tệp `src/routes/production.ts` để lấy danh sách các đơn hàng chưa hoàn tất tiến độ kèm tính toán tỷ lệ hao hụt phế liệu.
- [x] 4. Áp dụng Logic Đánh giá Rủi ro (Server Heuristics):
  - Viết giải thuật so sánh chênh lệch giữa tỷ lệ thời gian trôi qua và tỷ lệ hoàn thành sản lượng thực tế.
  - Phán xử cấp độ rủi ro `riskLevel` (`CRITICAL` | `WARNING` | `SAFE`).
  - Gán chuỗi thông điệp chỉ dẫn hành động `suggestedAction` tĩnh.
- [x] 5. Unit & Manual Integration Test: Khởi chạy API và kiểm tra dữ liệu JSON thô trả về thông qua trình duyệt hoặc cURL.
- [x] 6. Build validation: Đảm bảo không có lỗi TypeScript (`pnpm run typecheck`).
```

Bạn đã sẵn sàng để tôi bắt đầu viết CODE chưa?
