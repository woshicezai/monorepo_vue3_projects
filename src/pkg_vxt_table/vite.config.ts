import { defineConfig, mergeConfig } from 'vite'
import baseConfig from '../../vite.config.base'
import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import'

export default defineConfig(() => {
  const config = {
    server: {
      port: 3005
    },
    plugins: [
      lazyImport({
        resolvers: [VxeResolver({ libraryName: 'vxe-table' })],
      }),
    ],
  }
  return mergeConfig(baseConfig, config)
}) 