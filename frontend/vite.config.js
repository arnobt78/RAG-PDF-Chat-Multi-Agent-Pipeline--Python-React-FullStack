import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
/**
 * Vite — dev proxy target is `VITE_DEV_PROXY_TARGET` (default http://127.0.0.1:8000).
 * Frontend API URL is still `VITE_API_BASE_URL` in `src/lib/env.ts`.
 */
export default defineConfig(function (_a) {
    var _b;
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), "");
    var proxyTarget = ((_b = env.VITE_DEV_PROXY_TARGET) === null || _b === void 0 ? void 0 : _b.trim()) || "http://127.0.0.1:8000";
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
            proxy: {
                "/api": {
                    target: proxyTarget,
                    changeOrigin: true,
                    rewrite: function (p) { return p.replace(/^\/api/, ""); },
                },
            },
        },
        build: {
            outDir: "dist",
            sourcemap: false,
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ["react", "react-dom", "react-router-dom"],
                        motion: ["framer-motion"],
                        icons: ["lucide-react"],
                    },
                },
            },
        },
    };
});
