/**
 * 监听 packages 目录的变化，执行 updateScripts 函数
 */
import path from 'path'
import chokidar from 'chokidar'
import { updateScripts } from './update-scripts'
// 监听 packages 目录的变化
const watcher = chokidar.watch(path.join(process.cwd(), 'packages'), {
  depth: 0, // 只监听一级目录
  ignoreInitial: true, // 忽略首次运行时的 add 事件
  persistent: true, // 持续监听
})

// 监听目录的添加、删除和重命名事件
watcher
  .on('addDir', (path: string) => {
    // 忽略 packages 目录本身
    if (path !== process.cwd() + '/packages') {
      console.log(`Directory ${path} has been added`)
      updateScripts()
    }
  })
  .on('unlinkDir', (path: string) => {
    console.log(`Directory ${path} has been removed`)
    updateScripts()
  })
  .on('ready', () => {
    console.log('Initial scan complete. Ready for changes')
  })
  .on('error', (error: Error) => console.error('Error happened', error))

// 处理进程退出
process.on('SIGINT', () => {
  watcher.close()
  process.exit(0)
})
