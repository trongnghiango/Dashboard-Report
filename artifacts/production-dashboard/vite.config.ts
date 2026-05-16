import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const mode = process.env.NODE_ENV || "development";
const env = loadEnv(mode, path.resolve(import.meta.dirname, "../../"), "");

const rawPort = env.VITE_PORT || "5173";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid VITE_PORT value: "${rawPort}"`);
}

const basePath = env.VITE_BASE_PATH || "/";
const apiUrl = env.VITE_API_URL || "http://localhost:3000";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname, "../../"), "");
  const isProduction = mode === "production";
  
  const rawPort = env.VITE_PORT || "5173";
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid VITE_PORT value: "${rawPort}"`);
  }

  const basePath = env.VITE_BASE_PATH || "/";
  const apiUrl = env.VITE_API_URL || "http://localhost:3000";

  return {
    envDir: "../../",
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      // Chỉ hiện overlay lỗi ở môi trường phát triển
      !isProduction && runtimeErrorOverlay(),
      ...(!isProduction &&
        process.env.REPL_ID !== undefined
        ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
        : []),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      sourcemap: !isProduction, // Dev cần sourcemap để debug
      minify: isProduction ? 'esbuild' : false, // Dev không cần minify để build nhanh
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Chỉ áp dụng manualChunks cho production để tránh làm chậm dev build
          manualChunks: isProduction ? (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('xlsx')) return 'xlsx-vendor';
              if (id.includes('recharts')) return 'viz-vendor';
              return 'vendor';
            }
          } : undefined,
        },
      },
    },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api": {
        target: apiUrl,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
