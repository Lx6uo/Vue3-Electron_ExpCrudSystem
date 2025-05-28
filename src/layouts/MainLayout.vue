<template>
  <div class="main-layout">
    <el-container>
      <el-aside width="200px">
        <div class="logo-container">
          <h3>基础数据录入计划系统</h3>
        </div>
        <el-menu :router="true" :default-active="activeMenu" class="el-menu-vertical" background-color="#304156"
          text-color="#bfcbd9" active-text-color="#409EFF">
          <el-menu-item index="/production-line">
            <el-icon>
              <Operation />
            </el-icon>
            <span>生产线信息</span>
          </el-menu-item>
          <el-menu-item index="/special-engine">
            <el-icon>
              <Setting />
            </el-icon>
            <span>特殊发动机</span>
          </el-menu-item>
          <el-menu-item index="/planned-color">
            <el-icon>
              <Brush />
            </el-icon>
            <span>计划用颜色配置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header height="60px">
          <div class="header-content">
            <div class="breadcrumb">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentModuleTitle }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="user-info">
              <el-tooltip content="当前用户" placement="bottom">
                <el-icon>
                  <User />
                </el-icon>
              </el-tooltip>
              <span>{{ currentUser }}</span>
            </div>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
        <el-footer>
          <div class="footer-content">

          </div>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { User, Setting, Operation, Brush } from '@element-plus/icons-vue'

const route = useRoute()

// 当前用户
const currentUser = ref('')

// 当前活动菜单
const activeMenu = ref(route.path)

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath
  }
)

// 计算当前模块标题
const currentModuleTitle = computed(() => {
  const path = route.path
  if (path.includes('special-engine')) {
    return '特殊发动机'
  } else if (path.includes('production-line')) {
    return '生产线信息'
  } else if (path.includes('planned-color')) {
    return '计划用颜色配置'
  }
  return '首页'
})

// 获取当前用户
onMounted(() => {
  // 由于Electron已禁用，使用模拟数据
  currentUser.value = '测试用户'
})
</script>

<style scoped>
.main-layout {
  height: 100%;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
  color: #bfcbd9;
  width: 200px;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #263445;
}

.el-menu-vertical {
  border-right: none;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
  overflow: auto;
  height: calc(100vh - 120px);
}

.el-footer {
  background-color: #fff;
  color: #666;
  text-align: center;
  line-height: 60px;
  border-top: 1px solid #e6e6e6;
  height: 60px;
}

.footer-content {
  font-size: 14px;
}
</style>