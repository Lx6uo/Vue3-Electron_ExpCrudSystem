import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { userInfo } from 'node:os'
import { connectToDatabase, closeConnection } from './database'
import { setupIpcHandlers } from './ipc'
import fs from 'node:fs'

// 禁用Windows 7的GPU加速
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// 设置Windows 10+通知的应用名称
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

// 单例应用锁
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// 删除electron security warnings
// 这个警告仅用于开发模式
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// 应用根目录
export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, '../..'),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}

let win: BrowserWindow | null = null
// 这里可以使用 https://github.com/sindresorhus/electron-is-dev
const url = process.env.VITE_DEV_SERVER_URL as string
const indexHtml = join(ROOT_PATH.dist, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: '生产管理系统',
    icon: join(ROOT_PATH.public, 'icon.ico'),
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
  })

  // 测试环境中打开开发者工具
  if (!app.isPackaged) {
    win.webContents.openDevTools()
  }

  // 加载外部URL或本地HTML文件
  if (url) {
    win.loadURL(url)
  } else {
    win.loadFile(indexHtml)
  }

  // 使用默认浏览器打开外部链接
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // 应用关闭时关闭数据库连接
  win.on('closed', () => {
    win = null
    closeConnection()
  })
}

// 应用准备就绪后创建窗口
app.whenReady().then(async () => {
  // 读取数据库配置
  try {
    const configPath = join(app.isPackaged ? process.resourcesPath : ROOT_PATH.dist, 'config/database.json')
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

    // 简化配置，SQLite只需要数据库名称
    const sqliteConfig = {
      database: config.database || 'production_management'
    }

    // 连接数据库
    const connected = await connectToDatabase(sqliteConfig)
    if (!connected) {
      dialog.showErrorBox('数据库连接失败', '无法创建或连接到SQLite数据库')
    }

    // 设置IPC处理程序
    setupIpcHandlers()

    // 创建窗口
    createWindow()
  } catch (error) {
    console.error('初始化失败:', error)
    dialog.showErrorBox('初始化失败', `无法读取数据库配置: ${error}`)
  }
})

// 关闭所有窗口时退出应用 (Windows & Linux)
app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') {
    closeConnection()
    app.quit()
  }
})

// macOS激活应用时创建窗口
app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// 获取当前Windows用户名
export function getCurrentUser() {
  try {
    return userInfo().username
  } catch (error) {
    console.error('获取用户名失败:', error)
    return 'unknown'
  }
}