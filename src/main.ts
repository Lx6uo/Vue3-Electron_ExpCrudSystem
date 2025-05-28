import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'
import './assets/styles/global.css'
// import './api' // 注释掉模拟数据API，使用Electron IPC通信

// 创建Vue应用实例
const app = createApp(App)

// 使用Pinia状态管理
app.use(createPinia())

// 使用Vue Router
app.use(router)

// 使用Element Plus
app.use(ElementPlus, {
  locale: zhCn
})

// 挂载应用
app.mount('#app')