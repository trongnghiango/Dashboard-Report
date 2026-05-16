import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  const isProduction = process.env.NODE_ENV === "production";

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    // --- CẤU HÌNH TỐI ƯU THEO MÔI TRƯỜNG ---
    minify: isProduction,           // Chỉ nén ở Prod để Dev build nhanh hơn
    treeShaking: true,
    sourcemap: isProduction ? false : "linked", // Prod không cần sourcemap để bảo mật & nhẹ
    target: isProduction ? "node22" : undefined, // Prod dùng syntax hiện đại nhất
    legalComments: isProduction ? "none" : "inline",
    drop: isProduction ? ["console", "debugger"] : [], // Xóa sạch log rác ở Prod
    // ---------------------------------------
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    // Chế độ Siêu Standalone: Đóng gói tất cả thư viện JS vào 1 file duy nhất
    // Chỉ giữ lại các file native binary (.node) nếu có
    external: ["*.node"],
    plugins: [
      esbuildPluginPino({ 
        transports: isProduction ? [] : ["pino-pretty"] 
      })
    ],
    // Make sure packages that are cjs only (e.g. express) but are bundled continue to work in our esm output file
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
    },
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
