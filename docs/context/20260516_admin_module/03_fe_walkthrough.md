## 1. Tóm tắt tính năng (Feature Summary)
- Components: `CreateUserModal`, `PermissionMatrix`, `SettingsTabs`.
- Pages: `UsersPage`, `RbacPage`, `SettingsPage`.
- API Hooks: `useAdminUsers`, `useRbacMatrix`, `useAdminSettings`...
- Navigation: Tích hợp vào `Layout` sidebar với `can()` check.

## 2. Quyết định kiến trúc UI/UX (Architecture Decisions)
- **Matrix Local State:** Dùng state local để lưu các thay đổi tạm thời trên ma trận quyền, chỉ gửi request lên BE khi người dùng bấm "Save". Tránh spam API.
- **Server-Driven UI:** Menu sidebar tự động ẩn/hiện dựa trên `abilities` của user.
- **Tabs for Settings:** Chia nhỏ cấu hình giúp giao diện bớt rối mắt.

## 3. Khó khăn & Xử lý (Troubleshooting)
- Icon `Settings` bị trùng lặp ở cuối Sidebar → Xóa phần tĩnh và đưa vào danh sách động có phân quyền.
- Lỗi hiển thị ma trận khi chưa chọn Role → Thêm `EmptyState` với icon Shield.
