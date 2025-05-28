import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

// 创建路由实例
const router = createRouter({
  // 使用hash模式，适合Electron应用
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      redirect: '/production-line',
      children: [
        {
          path: '/production-line',
          name: 'ProductionLine',
          component: () => import('../views/ProductionLine/index.vue'),
          meta: { title: '生产线信息' }
        },
        {
          path: '/special-engine',
          name: 'SpecialEngine',
          component: () => import('../views/SpecialEngine/index.vue'),
          meta: { title: '特殊发动机' }
        },
        {
          path: '/planned-color',
          name: 'PlannedColor',
          component: () => import('../views/PlannedColor/index.vue'),
          meta: { title: '计划用颜色配置' }
        }
      ]
    }
  ]
})

export default router