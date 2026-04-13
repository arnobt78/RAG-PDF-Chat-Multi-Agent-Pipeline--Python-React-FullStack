import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
/**
 * Vite Configuration
 *
 * Features:
 * - React plugin with Fast Refresh
 * - Path aliases for clean imports (@/components, @/hooks, etc.)
 * - Dev server proxy for API calls
 * - Optimized build settings
 */
export default defineConfig({
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
                target: "http://localhost:8000",
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ""); },
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
});
