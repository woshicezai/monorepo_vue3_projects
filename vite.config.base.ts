import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// 通用配置
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@libs": path.resolve(__dirname, "./src/libs"),
    },
  },
  build: {
    // 通用构建配置
    target: "es2015",
    minify: "terser",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vue-vendor": ["vue", "pinia"],
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
  },
  // 通用开发服务器配置
  server: {
    port: 3000,
    cors: true,
    open: true,
  },
  base: './',
});
