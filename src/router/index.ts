import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Layout from '@/components/Layout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/order/share/:id',
    name: 'OrderShare',
    component: () => import('@/views/OrderShare.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'banner',
        name: 'Banner',
        component: () => import('@/views/Banner.vue'),
        meta: { title: '广告图管理', icon: 'Picture' }
      },
      {
        path: 'goods',
        name: 'Goods',
        component: () => import('@/views/Goods.vue'),
        meta: { title: '商品管理', icon: 'Goods' }
      },
      {
        path: 'goodsType',
        name: 'goodsType',
        component: () => import('@/views/goodsType.vue'),
        meta: { title: '商品管理', icon: 'Goods' }
      },
      {
        path: 'productSpec',
        name: 'ProductSpec',
        component: () => import('@/views/ProductSpec.vue'),
        meta: { title: '商品规格配置', icon: 'Setting' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/Orders.vue'),
        meta: { title: '订单管理', icon: 'Document' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'address',
        name: 'Address',
        component: () => import('@/views/Address.vue'),
        meta: { title: '地址管理', icon: 'Location' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
