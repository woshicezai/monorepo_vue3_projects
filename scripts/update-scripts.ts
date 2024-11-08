import fs from 'fs'
import path from 'path'
/**
 * 当运行 pnpm install 时，会自动更新 package.json 中的 scripts命令
 * 将src下的项目以 pkg_ 开头的项目的 启动和构建命令添加到 package.json 中
 */

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
  if (key.startsWith('dev:') || key.startsWith('build:')) {
    delete packageJson.scripts[key]
  }
})

// 添加新的脚本
projects.forEach(project => {
  // 移除 pkg_ 前缀，使命令更简洁
  const projectName = project
  packageJson.scripts[`dev:${projectName}`] = `pnpm --filter ${project} dev`
  packageJson.scripts[`build:${projectName}`] = `pnpm --filter ${project} build`
})

// 写回 package.json
fs.writeFileSync(rootPackageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

console.log('Scripts updated successfully!')
