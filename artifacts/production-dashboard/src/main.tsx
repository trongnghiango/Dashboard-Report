console.log("[main.tsx] Execution started");
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setOnTokenRefreshed } from "@workspace/api-client-react";
import { useAuthStore } from "./stores/auth";

setAuthTokenGetter(() => useAuthStore.getState().accessToken);

// Quan trọng: Đồng bộ token mới từ customFetch (hạ tầng) vào Zustand (ứng dụng)
setOnTokenRefreshed((newToken) => {
  const { user, abilities } = useAuthStore.getState();
  if (user) {
    useAuthStore.getState().setAuth(user, abilities, newToken);
  }
});

window.onerror = (msg, url, line, col, error) => {
  document.body.innerHTML = `<div style="color:red;padding:20px;font-family:sans-serif;">
    <h2>Runtime Error:</h2>
    <p>${msg}</p>
    <pre>${error?.stack}</pre>
  </div>`;
  return false;
};

createRoot(document.getElementById("root")!).render(<App />);
