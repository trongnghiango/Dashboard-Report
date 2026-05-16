import React from "react";
import { Redirect } from "wouter";
import { useAuthStore } from "../../stores/auth";
import { useMeQuery } from "../../hooks/api/useAuth";
import { Loader2 } from "lucide-react";

console.log("[ProtectedRoute.tsx] Module loaded");

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const isLoggedIn = localStorage.getItem("is_logged_in") === "true";
  const { isLoading } = useMeQuery(!isAuthenticated && isLoggedIn);

  console.log("[ProtectedRoute] Status:", { isLoggedIn, isAuthenticated, isLoading });

  // 1. Nếu không có dấu hiệu đã đăng nhập -> Chuyển hướng ngay về login
  if (!isLoggedIn && !isAuthenticated) {
    console.log("[ProtectedRoute] Not logged in, redirecting to /login");
    return <Redirect to="/login" />;
  }

  // 1. Nếu đang load thông tin user -> Hiện loading
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Nếu không load, mà cũng không có auth -> Redirect về login
  if (!isAuthenticated) {
    console.log("[ProtectedRoute] Unauthorized, redirecting to /login");
    return <Redirect to="/login" />;
  }

  // 4. Đã xác thực thành công
  return <>{children}</>;
};
