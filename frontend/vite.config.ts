import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Vite — dev proxy target is `VITE_DEV_PROXY_TARGET` (default http://127.0.0.1:8000).
 * Frontend API URL is still `VITE_API_BASE_URL` in `src/lib/env.ts`.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget =
    env.VITE_DEV_PROXY_TARGET?.trim() || "http://127.0.0.1:8000";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/components": path.resolve(__dirname, "./src/components"),
        "@/hooks": path.resolve(__dirname, "./src/hooks"),
        "@/lib": path.resolve(__dirname, "./src/lib"),
        "@/types": path.resolve(__dirname, "./src/types"),
        "@/context": path.resolve(__dirname, "./src/context"),
        "@/pages": path.resolve(__dirname, "./src/pages"),
      },
    },
    server: {
      port: 5173,
      // Use ``/api/`` (slash after ``api``) so the SPA route ``/api-status`` is not
      // mistaken for ``/api`` + rewrite → ``/-status`` on the backend.
      proxy: {
        "/api/": {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (p) =>
            p.startsWith("/api/oversight") ? p : p.replace(/^\/api\//, "/"),
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes("react-router-dom") ||
              id.includes("/react/") ||
              id.includes("react-dom")
            ) {
              return "vendor";
            }
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("lucide-react")) return "icons";
            return undefined;
          },
        },
      },
    },
  };
});
