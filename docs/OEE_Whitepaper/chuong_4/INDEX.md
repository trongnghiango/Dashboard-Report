---
title: "Chương 4: Kiến trúc hệ thống chịu tải và xử lý dữ liệu lớn"
summary: "Compute Offloading, Indexing, State Management và hướng tới Real-time."
description: |
  Chương này phân tích các giải pháp kiến trúc phần mềm để đảm bảo hệ thống
  vận hành mượt mà khi dữ liệu phình to lên hàng trăm nghìn dòng.
tags:
  - architecture
  - engineering
  - whitepaper
status: current
last_updated: "2026-05-14"
---

# CHƯƠNG 4: KIẾN TRÚC HỆ THỐNG CHỊU TẢI VÀ XỬ LÝ DỮ LIỆU LỚN

### 4.1. Điểm nghẽn hiệu năng khi dữ liệu phình to
Khi số lượng dòng dữ liệu vượt qua con số hàng chục nghìn, file Excel sẽ bị ì ách. Tương tự, nếu đẩy toàn bộ dữ liệu thô lên trình duyệt rồi dùng Javascript để tự nhóm, trình duyệt sẽ ngốn sạch RAM và gây giật lag. Giải pháp là dồn gánh nặng tính toán về cho phía Server (Backend).

### 4.2. Chiến lược Phân chia tải (Compute Offloading)
Áp dụng nguyên lý: Việc gì nặng hãy để Server làm, trình duyệt chỉ hiển thị.
Backend sẽ thực hiện câu lệnh `GROUP BY` theo `LỆNH XK` ngay trong database để tính ra các con số tổng, sau đó mới gửi mảng dữ liệu đã thu gọn lên Frontend. Điều này giúp giảm tải cho trình duyệt tới 90%.

### 4.3. Tối ưu hóa Cơ sở dữ liệu (Indexing & Query Optimization)
Cần đánh chỉ mục (Index) cho các cột: `ngay_san_xuat` (để lọc thời gian) và `order_id` (để JOIN bảng). Đối với các báo cáo nặng như OEE, đề xuất sử dụng **Materialized View** để tính toán sẵn dữ liệu.

### 4.4. Quản lý Trạng thái (State Management) ở Frontend
Phân chia thành 2 loại:
*   **Server State (Dùng React Query):** Lưu bộ nhớ đệm dữ liệu từ API để hiển thị tức thì.
*   **UI State (Dùng useState):** Quản lý trạng thái đóng/mở (Expand/Collapse) của các hàng trong bảng.

### 4.5. Hướng tới kiến trúc Real-time
Để tiến tới sự hoàn thiện, cần loại bỏ file Excel. Sử dụng công nghệ **WebSocket** hoặc **SSE** để Server chủ động "đẩy" dữ liệu mới từ máy sản xuất xuống trình duyệt ngay lập tức.

---
[⬅️ Quay lại trang chủ](../INDEX.md)
