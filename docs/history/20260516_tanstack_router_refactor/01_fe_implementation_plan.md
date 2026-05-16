# FE Implementation Plan: TanStack Router Refactor

## 1. Cài đặt Dependency
```bash
pnpm --filter @workspace/production-dashboard add @tanstack/react-router
```

## 2. Cấu trúc thư mục Routing (Proposed)
Do chúng ta chọn **Code-based Routing** để refactor nhanh, cấu trúc sẽ tập trung tại:
- `src/router.tsx`: Khởi tạo Router instance và Context.
- `src/routes/`: Thư mục chứa các định nghĩa Route (nếu sau này muốn tách nhỏ).

## 3. Định nghĩa cây Route (Route Tree Definition)

### A. Root Route (Main Layout)
- File: `src/routes/root.ts` (hoặc định nghĩa trực tiếp trong router.tsx)
- Chứa: `Layout` component.
- Context: Truyền `auth` (Zustand) và `queryClient`.

### B. Auth Guard (Authenticated Route Group)
Sử dụng `createRoute` với `beforeLoad`:
```typescript
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});
```

### C. Search Params Validation (Ví dụ trang Sản xuất)
```typescript
const productionRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/san-xuat',
  validateSearch: productionSearchSchema, // Zod schema
  component: ProductionPage,
});
```

## 4. Kế hoạch Refactor từng bước (Phòng ngừa lỗi)

### Giai đoạn 1: Song song (Parallel)
1. Cài đặt thư viện.
2. Tạo file `router.tsx` và định nghĩa cây route nhưng **chưa** thay thế `App.tsx`.
3. Test thử route `/login` và `/` với Router mới.

### Giai đoạn 2: Thay thế (Switch)
1. Thay thế `WouterRouter` trong `main.tsx` bằng `RouterProvider`.
2. Chuyển toàn bộ các trang Admin (Users, RBAC) sang Router mới.

### Giai đoạn 3: Dọn dẹp (Cleanup)
1. Cập nhật `Layout` component: thay thẻ `<Link>` của wouter bằng của TanStack Router.
2. Xóa bỏ hoàn toàn `wouter` và các component bảo vệ cũ (`ProtectedRoute`).

## 5. Xác nhận Contracts
- Trang Sản xuất: Cần Zod schema cho lọc theo ngày/máy (Sẽ định nghĩa trong `src/hooks/api/useProduction.ts` hoặc shared).

---
Thiết kế này đã chuẩn chưa? Nếu OK, tôi sẽ xuất Checklist thực thi (Bước 3).
