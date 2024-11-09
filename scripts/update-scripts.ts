/**
 * 监听 packages 目录的变化，更新 package.json 中的 scripts
 * 自动创建 lint、format、predev、dev、build 脚本
 */

import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'

function updateScripts() {
  // 读取 src 目录
  const srcPath = path.join(process.cwd(), 'packages')
  const rootPackageJsonPath = path.join(process.cwd(), 'package.json')

  // 获取所有packages目录下的子项目
  const projects = fs.readdirSync(srcPath).filter(file => {
    const stats = fs.statSync(path.join(srcPath, file))
    return stats.isDirectory()
  })

  // 更新 package.json
  const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'))

  // 更新 scripts
  packageJson.scripts = packageJson.scripts || {}

  // 清除旧的 dev 和 build 脚本
  Object.keys(packageJson.scripts).forEach(key => {
    if (
      key.startsWith('dev:') ||
      key.startsWith('build:') ||
      key.startsWith('lint:') ||
      key.startsWith('format:') ||
      key.startsWith('predev:')
    ) {
      delete packageJson.scripts[key]
    }
  })

  // 添加新的脚本
  projects.forEach(project => {
    packageJson.scripts[`lint:${project}`] =
      `eslint "packages/${project}/**/*.{vue,js,jsx,ts,tsx}" --fix`
    packageJson.scripts[`format:${project}`] =
      `prettier --write "packages/${project}**/*.{vue,ts,tsx,js,jsx,json,md}"`
    packageJson.scripts[`predev:${project}`] = `pnpm lint:${project} && pnpm format:${project}`
    packageJson.scripts[`dev:${project}`] = `pnpm --filter ${project} dev`
    packageJson.scripts[`build:${project}`] = `pnpm --filter ${project} build`
  })

  // 写回 package.json
  fs.writeFileSync(rootPackageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  console.log('Scripts updated successfully!')
}

// 首次运行
updateScripts()

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
