---
title: "Yêu cầu Cung cấp Dữ liệu Sản xuất Chuẩn hóa"
summary: "Tài liệu yêu cầu bộ phận sản xuất cung cấp dữ liệu chi tiết để tính OEE chính xác."
description: |
  Tài liệu này liệt kê chi tiết các trường thông tin cần bổ sung và quy chuẩn định dạng file
  để gửi cho bộ phận sản xuất/thống kê xưởng, nhằm phục vụ việc tính toán OEE chính xác tuyệt đối.
tags:
  - communication
  - data-quality
  - oee
status: current
last_updated: "2026-05-14"
---

# YÊU CẦU CUNG CẤP DỮ LIỆU SẢN XUẤT CHUẨN HÓA
*(Phục vụ Hệ thống Dashboard hiển thị thời gian thực và đo lường OEE)*

**Kính gửi:** Ban Quản lý Sản xuất / Bộ phận Thống kê Nhà máy.

Để hệ thống Dashboard có thể tính toán các chỉ số Hiệu suất thiết bị tổng thể (OEE) và tiến độ đơn hàng một cách chính xác tuyệt đối (loại bỏ các giả định xấp xỉ hiện tại), chúng tôi kính đề nghị Bộ phận Sản xuất điều chỉnh và bổ sung các thông tin sau vào quy trình ghi chép và xuất file dữ liệu:

---

### 1. CÁC THÔNG TIN CẦN BỔ SUNG CHI TIẾT

#### 1.1. Thời gian chạy máy thực tế (Trọng tâm)
*   **Hiện trạng:** Cột `Thời Gian TS` trong file hiện tại đang bị trống phần lớn dữ liệu, khiến hệ thống phải giả định mọi ca đều chạy đủ 100% thời gian (12h).
*   **Yêu cầu:** Ghi nhận chính xác **Số phút máy chạy thực tế** trong ca.
*   **Hoặc tốt hơn (Chuẩn MES):** Ghi nhận **Số phút dừng máy** (Downtime) và **Lý do dừng máy** (Ví dụ: Sửa chữa: 30p, Thay sợi: 15p, Cúp điện: 60p...).
*   **Mục đích:** Để tính chính xác chỉ số **Mức độ Khả dụng (Availability)**.

#### 1.2. Phế liệu chi tiết theo Ca (Thay vì theo Ngày)
*   **Hiện trạng:** Phế liệu đang được tổng hợp chung theo Ngày (24h), hệ thống đang phải tự chia đều cho các ca theo tỷ lệ sản lượng.
*   **Yêu cầu:** Ghi nhận lượng phế liệu phát sinh **riêng cho từng Ca** (Ca 1, Ca 2, Ca 3). Ca nào làm phát sinh lỗi thì ghi nhận cho ca đó.
*   **Mục đích:** Để tính chính xác chỉ số **Chất lượng (Quality)** của từng kíp trực.

#### 1.3. Bảng định mức công suất (Sản lượng tiêu chuẩn)
*   **Yêu cầu:** Cung cấp bảng tra cứu (hoặc điền trực tiếp vào file) **Sản lượng định mức (kg)** của từng loại sợi trên từng dòng máy trong 1 giờ (hoặc trong 1 ca 12h).
*   **Mục đích:** Để tính chính xác chỉ số **Hiệu suất (Performance)** thay vì phải lấy sản lượng lớn nhất trong lịch sử làm mốc.

---

### 2. QUY CHUẨN ĐỊNH DẠNG FILE DỮ LIỆU (EXCEL)

Để hệ thống tự động đọc file (Import) không bị lỗi và không bị sai lệch số liệu, file Excel xuất ra cần tuân thủ nghiêm ngặt các quy tắc sau:

1.  **Không gộp ô (No Merged Cells):** Mỗi dòng trong bảng phải là một bản ghi độc lập, chứa đầy đủ thông tin ngày, ca, mã đơn hàng. Không gộp ô ngày cho nhiều dòng bên dưới.
2.  **Không chèn dòng tổng cộng (No Summary Rows):** Tuyệt đối không chèn các dòng "Cộng tổng", "Tổng ngày" ở giữa hoặc cuối bảng. Hệ thống Dashboard sẽ tự động tính toán các con số tổng này. Việc chèn dòng tổng làm sai lệch các phép tính tìm cực trị.
3.  **Đồng nhất mã (Consistent Codes):** Mã sợi, Mã đơn hàng, Mã Lệnh XK phải viết đúng chuẩn, không thừa/thiếu khoảng trắng ở đầu hoặc cuối.

---

### 3. MẪU BẢNG DỮ LIỆU ĐỀ XUẤT (Cho 1 dòng dữ liệu)

Để thuận tiện, bộ phận sản xuất có thể tham khảo mẫu cấu trúc bảng dữ liệu tối ưu dưới đây:

| Ngày | Ca | Máy | Lệnh XK | Order ID | Mã Sợi | Sản Lượng (kg) | Thời gian chạy (Phút) | Số phút dừng (Phút) | Lý do dừng | Phế kéo máy (kg) | Phế chạy máy (kg) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-05-14 | 1 | Máy 01 | LXK001 | ORD123 | Sợi PE | 1200 | 680 | 40 | Sửa xích | 10 | 5 |

Kính mong Bộ phận Sản xuất phối hợp thực hiện để nâng cao năng lực quản trị và tối ưu hóa chi phí cho nhà máy.
