import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@root': path.resolve(__dirname, 'src'),
      '@local': path.resolve(process.cwd(), 'src'),
    }
  },
  build: {
    target: 'es2015',
    outDir: "dist",
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
