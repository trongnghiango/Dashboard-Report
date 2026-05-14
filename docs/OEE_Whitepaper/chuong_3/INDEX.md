---
title: "Chương 3: Hệ thống đo lường hiệu suất (OEE)"
summary: "Chi tiết cách tính A, P, Q từ dữ liệu thiếu và lệch pha."
description: |
  Chương này đi sâu vào toán học và thuật toán xử lý dữ liệu để tính toán ra
  chỉ số OEE chuẩn công nghiệp từ file dữ liệu Excel chưa hoàn thiện.
tags:
  - architecture
  - algorithm
  - whitepaper
status: current
last_updated: "2026-05-14"
---

# CHƯƠNG 3: HỆ THỐNG ĐO LƯỜNG HIỆU SUẤT (OEE)

### 3.1. Triết lý OEE trong sản xuất hiện đại
**OEE (Overall Equipment Effectiveness - Hiệu suất Thiết bị Tổng thể)** là tiêu chuẩn vàng toàn cầu để đo lường năng suất sản xuất. Điểm độc đáo của OEE là nó không chỉ nhìn vào số lượng sản phẩm làm ra, mà nó bóc tách năng suất dưới 3 khía cạnh độc lập để tìm ra lãng phí:

1. **Mức độ Khả dụng (Availability - A):** Đo lường tổn thất về thời gian. Máy có thực sự chạy trong suốt thời gian ca làm việc không, hay bị dừng do hỏng hóc, thay khuôn, thiếu nguyên liệu?
2. **Hiệu suất (Performance - P):** Đo lường tổn thất về tốc độ. Khi máy chạy, nó có chạy đúng với tốc độ tiêu chuẩn (định mức) không, hay bị chạy chậm hơn?
3. **Chất lượng (Quality - Q):** Đo lường tổn thất về chất lượng. Trong tổng số sản phẩm làm ra, bao nhiêu % là hàng đạt chuẩn và bao nhiêu % là phế liệu?

Công thức tính OEE là tích của 3 chỉ số trên: **OEE = A x P x Q**.

### 3.2. Availability (Mức độ Khả dụng) - Bài toán thiếu dữ liệu thời gian
Theo chuẩn công nghiệp, chỉ số Khả dụng (Availability) được tính bằng công thức: 
`Thời gian chạy máy thực tế / Thời gian sản xuất theo kế hoạch`.

Trong bài toán của chúng ta, thời gian kế hoạch được xác định cố định là **12 giờ (720 phút)** cho mỗi ca làm việc. Tuy nhiên, do cột `Thời Gian TS` hầu hết bị để trống, hệ thống áp dụng một **Giả định thực nghiệm (Heuristic)**: Đối với những dòng bị trống dữ liệu thời gian, hệ thống tự động hiểu là máy đã chạy đủ 12 giờ (Khả dụng = 100%). 

### 3.3. Performance (Hiệu suất) - Thuật toán đi tìm "Định mức" từ lịch sử
Chỉ số Hiệu suất (Performance) đo lường tốc độ tạo ra sản phẩm, được tính bằng: 
`Sản lượng thực tế / Sản lượng định mức (lý thuyết)`.

Do thiếu cột định mức, hệ thống áp dụng tư duy **Khai phá Dữ liệu (Data-driven)**: Tự động quét lịch sử và lấy ra con số **Sản lượng lớn nhất** từng đạt được trong một ca (dưới 50,000 kg để loại bỏ dòng tổng cộng) làm mốc 100%.

### 3.4. Quality (Chất lượng) - Nghệ thuật phân bổ phế liệu
Chỉ số cuối cùng trong bộ ba OEE là Chất lượng (Quality), được tính bằng công thức: 
`Sản lượng đạt chuẩn / Tổng sản lượng đầu vào`.

Áp dụng thuật toán **Phân bổ tỷ lệ thuận**: 
`Phế liệu phân bổ cho Ca X = Tổng phế trong ngày x (Sản lượng Ca X / Tổng sản lượng trong ngày)`.

### 3.5. Tổng hợp OEE và Ý nghĩa thực tiễn
Sau khi đã tính toán được 3 chỉ số thành phần A, P và Q cho từng ca trực, hệ thống Dashboard sẽ nhân chúng lại với nhau để cho ra chỉ số OEE cuối cùng: `OEE = A x P x Q`.

OEE cung cấp một **Thước đo duy nhất (Single Metric)** để đánh giá "sức khỏe" của một ca sản xuất. Nó biến những dữ liệu tĩnh trong file Excel thành những **Hành động quản trị cụ thể** (biết chính xác ca nào yếu khâu nào để cải tiến).

---
[⬅️ Quay lại trang chủ](../INDEX.md)
