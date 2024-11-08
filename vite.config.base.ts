import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// 获取当前项目名称
const getProjectName = () => {
  const projectPath = process.cwd();
  return projectPath.split("/").pop(); // 获取路径最后一段作为项目名
};

export default defineConfig({
  plugins: [
    vue(),
  ],
  base: "./",
  resolve: {
    alias: {
      "@root": path.resolve(__dirname, "src"),
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  build: {
    target: "es2020",
    // 设置输出目录为根目录的 dist/项目名
    outDir: path.resolve(__dirname, `dist/${getProjectName()}`),
    minify: "terser",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        manualChunks: {
          "vue-vendor": ["vue", "pinia"],
        },
      },
    },
  },
});
