import { defineConfig, mergeConfig } from 'vite'
import baseConfig from '../../vite.config.base'

export default defineConfig(() => {
  const config = {
    server: {
      port: 3006,
    },
  };
  return mergeConfig(baseConfig, config);
});
