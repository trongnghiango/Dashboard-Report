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
  const token = localStorage.getItem("auth_token");
  const { isLoading } = useMeQuery(!isAuthenticated);

  console.log("[ProtectedRoute] Status:", { token: !!token, isAuthenticated, isLoading });

  // 1. Nếu không có token -> Chuyển hướng ngay về login
  if (!token) {
    console.log("[ProtectedRoute] No token, redirecting to /login");
    return <Redirect to="/login" />;
  }

  // 2. Nếu có token nhưng đang load thông tin user -> Hiện loading
  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 3. Nếu đã load xong mà vẫn chưa xác thực thành công (Token sai/hết hạn) -> Chuyển hướng
  if (!isLoading && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // 4. Đã xác thực thành công
  return <>{children}</>;
};
