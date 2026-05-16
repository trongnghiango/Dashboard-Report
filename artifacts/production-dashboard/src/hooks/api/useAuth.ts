import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch, setAuthTokenGetter } from "@workspace/api-client-react";
import { LoginRequest, AuthResponse } from "@workspace/api-zod";
import { useAuthStore } from "../../stores/auth";

// Khởi tạo authTokenGetter để customFetch luôn lấy token từ memory (Zustand)
// Đặt ở module-level để chạy 1 lần duy nhất khi file được import
setAuthTokenGetter(() => useAuthStore.getState().accessToken);

export const useLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await customFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      // Lưu token vào memory (Zustand), KHÔNG lưu localStorage
      setAuth(data.user, data.abilities, data.accessToken);
      // Chỉ lưu flag đơn giản để biết user đã đăng nhập (không nhạy cảm)
      localStorage.setItem("is_logged_in", "true");
    },
  });
};

export const useMeQuery = (enabled = true) => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const response = await customFetch<Pick<AuthResponse, "user" | "abilities">>("/api/auth/me");
        // /me không trả về accessToken mới, chỉ cập nhật user + abilities
        // accessToken đã có trong store từ lúc login hoặc refresh
        const currentToken = useAuthStore.getState().accessToken ?? "";
        setAuth(response.user, response.abilities, currentToken);
        return response;
      } catch (err) {
        clearAuth();
        localStorage.removeItem("is_logged_in");
        throw err;
      }
    },
    // Dùng flag "is_logged_in" thay vì kiểm tra token trong localStorage
    enabled: enabled && !!localStorage.getItem("is_logged_in"),
    retry: false,
  });
};

export const useLogoutMutation = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await customFetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      clearAuth();
      localStorage.removeItem("is_logged_in");
      queryClient.clear();
    },
    onError: () => {
      // Dù lỗi cũng xóa state local để tránh treo session
      clearAuth();
      localStorage.removeItem("is_logged_in");
      queryClient.clear();
    },
  });
};
