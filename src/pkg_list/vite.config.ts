import { defineConfig, mergeConfig } from "vite";
import baseConfig from "../../vite.config.base";
import path from 'path';

export default defineConfig((configEnv) => {
  const config = {
    server: {
      port: 3006,
    },
  };

  return mergeConfig(baseConfig, config);
});
