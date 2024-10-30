import { defineConfig, mergeConfig } from "vite";
import baseConfig from "../../vite.config.base";

export default defineConfig((configEnv) => {
  const config = {
    // 子项目特定配置
    server: {
      port: 3004, // 覆盖基础配置的端口
    },
    build: {
      outDir: "dist",
    },
    // 其他特定配置...
  };

  return mergeConfig(baseConfig, config);
});
