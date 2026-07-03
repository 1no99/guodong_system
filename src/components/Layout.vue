<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <span v-if="!isCollapse">果冻</span>
        <span v-else>果冻</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :router="true"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item
          v-for="item in menuList"
          :key="item.path"
          :index="item.path"
          @click="handleMenuClick(item)"
        >
          <el-icon><component :is="item.meta.icon" /></el-icon>
          <template #title>{{ item.meta.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="isCollapse = !isCollapse">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <div class="tags-container">
        <el-tag
          v-for="tab in tabsStore.tabs"
          :key="tab.path"
          :closable="tab.path !== '/dashboard'"
          :effect="tabsStore.activeTab === tab.path ? 'dark' : 'plain'"
          @click="handleTabClick(tab)"
          @close="handleTabClose(tab)"
          class="tag-item"
        >
          {{ tab.title }}
        </el-tag>
      </div>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = ref(route.path)
const currentTitle = ref('首页')

const menuList = [
  { path: '/dashboard', meta: { title: '首页', icon: 'HomeFilled' } },
  { path: '/banner', meta: { title: '广告图管理', icon: 'Picture' } },
  { path: '/goods', meta: { title: '商品管理', icon: 'Goods' } },
  { path: '/goodsType', meta: { title: '商品分类管理', icon: 'Location' } },
  { path: '/productSpec', meta: { title: '商品规格配置', icon: 'Setting' } },
  { path: '/orders', meta: { title: '订单管理', icon: 'Document' } },
  { path: '/users', meta: { title: '用户管理', icon: 'User' } },
  // { path: '/address', meta: { title: '地址管理', icon: 'Location' } }
]

const handleMenuClick = (item: any) => {
  tabsStore.addTab({
    path: item.path,
    title: item.meta.title,
    name: item.name
  })
  currentTitle.value = item.meta.title
}

const handleTabClick = (tab: any) => {
  router.push(tab.path)
  tabsStore.activeTab = tab.path
  activeMenu.value = tab.path
  const menuItem = menuList.find(m => m.path === tab.path)
  if (menuItem) {
    currentTitle.value = menuItem.meta.title
  }
}

const handleTabClose = (tab: any) => {
  tabsStore.removeTab(tab.path)
  if (tabsStore.activeTab !== tab.path) {
    router.push(tabsStore.activeTab)
    activeMenu.value = tabsStore.activeTab
  }
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      tabsStore.clearTabs()
      router.push('/login')
    })
  }
}

watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
  const menuItem = menuList.find(m => m.path === newPath)
  if (menuItem) {
    currentTitle.value = menuItem.meta.title
  }
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  background-color: #2b3a4a;
}

.sidebar-menu {
  border-right: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #409EFF;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.tags-container {
  display: flex;
  gap: 8px;
  padding: 8px 20px;
  background-color: #f0f2f5;
  border-bottom: 1px solid #e6e6e6;
}

.tag-item {
  cursor: pointer;
}

.main-content {
  background-color: #f0f2f5;
  padding: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
