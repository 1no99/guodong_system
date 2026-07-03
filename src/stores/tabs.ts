import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Tab {
  path: string
  title: string
  name: string
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<Tab[]>([
    { path: '/dashboard', title: '首页', name: 'Dashboard' }
  ])
  const activeTab = ref('/dashboard')

  const addTab = (tab: Tab) => {
    const exist = tabs.value.find(t => t.path === tab.path)
    if (!exist) {
      tabs.value.push(tab)
    }
    activeTab.value = tab.path
  }

  const removeTab = (targetPath: string) => {
    const index = tabs.value.findIndex(t => t.path === targetPath)
    if (index > -1) {
      tabs.value.splice(index, 1)
      if (activeTab.value === targetPath && tabs.value.length > 0) {
        activeTab.value = tabs.value[Math.max(0, index - 1)].path
      }
    }
  }

  const clearTabs = () => {
    tabs.value = [{ path: '/dashboard', title: '首页', name: 'Dashboard' }]
    activeTab.value = '/dashboard'
  }

  return {
    tabs,
    activeTab,
    addTab,
    removeTab,
    clearTabs
  }
})
