# Kế hoạch Kiến trúc Chi tiết Backend - Cảnh báo Sớm & Quản trị Rủi ro Đơn hàng

## A. Database Schema
- Không khởi tạo hay thay đổi bảng/schema vật lý mới để bảo vệ trọn vẹn ranh giới nạp dữ liệu phẳng từ file Excel.
- Khai thác tối đa các chỉ mục (indexes) hiện có trên `productionTable` (`ngaySanXuat`, `orderId`) và `ordersTable`.

## B. Domain Layer
- Định nghĩa ranh giới hợp đồng (Contract Interface) tĩnh đại diện cho mô hình dự báo rủi ro:
  ```typescript
  export type RiskLevel = "CRITICAL" | "WARNING" | "SAFE";

  export interface OrderRiskForecast {
    donHang: string;
    maSoi: string;
    tenSoi: string;
    slDonHang: number;
    slDonHangDaSX: number;
    tyLeHoanThanh: number;
    tyLePheLieu: number;
    daysRemaining: number;
    riskLevel: RiskLevel;
    suggestedAction: string;
  }
  ```

## C. Infrastructure Layer
- Tích hợp logic truy vấn gom nhóm và lọc biên độ rủi ro trực tiếp trong tệp định tuyến `src/routes/production.ts`.
- Sử dụng phép `leftJoin` hoặc gom nhóm song song để tính toán tổng phế liệu và so sánh tốc độ hoàn thành Lệnh.

## D. Application Layer
- Hàm xử lý API `GET /api/analytics/summary` sẽ ánh xạ danh sách các Lệnh chưa hoàn thành (`tyLeHoanThanh < 100`), tính toán mức độ hụt tiến độ hoặc vượt ngưỡng phế liệu (Ví dụ: Hao hụt phế liệu > 5.0% hoặc trễ tiến độ thời gian thực tế > 15%), từ đó gán nhãn `riskLevel` tương ứng.

## E. Presentation Layer & Contracts
- **Cập nhật OpenAPI:** Bổ sung schema định nghĩa đối tượng `OrderRiskForecast` và mảng `ordersAtRisk` vào tài liệu OpenAPI `lib/api-spec/openapi.yaml`.
- **Tự động hóa Zod/Client Hooks:** Chạy lệnh sinh mã tự động `pnpm --filter @workspace/api-spec run codegen` để xuất ra các tệp hợp đồng Zod chuẩn xác làm nguồn sự thật.

## F. Module Wiring
- Giao diện route tĩnh giữ nguyên, phân phối trực tiếp luồng JSON mở rộng ra ngoài mà không phá vỡ bất kỳ client tiêu thụ nào hiện có.

Kế hoạch này đã chuẩn chưa? Nếu OK, tôi sẽ xuất Checklist.
