<template>
  <div class="app-container">
    <el-config-provider :locale="zhCn">
      <router-view />
    </el-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>

<style>
.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>