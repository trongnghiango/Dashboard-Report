console.log("[main.tsx] Execution started");
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

setAuthTokenGetter(() => localStorage.getItem("auth_token"));

window.onerror = (msg, url, line, col, error) => {
  document.body.innerHTML = `<div style="color:red;padding:20px;font-family:sans-serif;">
    <h2>Runtime Error:</h2>
    <p>${msg}</p>
    <pre>${error?.stack}</pre>
  </div>`;
  return false;
};

createRoot(document.getElementById("root")!).render(<App />);
