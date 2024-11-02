import { defineConfig, mergeConfig } from 'vite'
import baseConfig from '../../vite.config.base'

export default defineConfig((configEnv) => {
  console.log("configEnv", configEnv);
  const config = {
    server: {
      port: 3005
    }
  }

  return mergeConfig(baseConfig, config)
}) 