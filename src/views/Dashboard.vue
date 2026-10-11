<template>
  <div class="dashboard">
    <!-- 时间筛选 -->
    <div style="background-color: #fff;padding: 10px;margin-bottom: 10px;text-align: right;">
          <el-date-picker
            v-model="timeForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :clearable="false"
            @change="handleDateChange"
          />
    </div>

    <!-- 统计数据卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in statistics" :key="item.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: item.color }">
              <el-icon :size="30"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatValue(item.value, item.key) }}</div>
              <div class="stat-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待处理订单列表 -->
     <Orders style="margin-top: 10px;" />

   
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getStatistics, getPendingOrders } from '@/api/dashboard'
import Orders from './Orders.vue' 
// 时间表单

const today = new Date().toISOString().split('T')[0]
const timeForm = reactive({
  dateRange: [today, today] // 默认当天
})

// 统计数据
const statistics = ref([
  { title: '完成订单数', value: 0, key: 'total_orders', icon: 'Document', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '总用户数', value: 0, key: 'total_users', icon: 'User', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '商品数量', value: 0, key: 'total_products', icon: 'Goods', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '总销售额（已发货）', value: 0, key: 'total_sales', icon: 'Money', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

// 待处理订单
const pendingOrders = ref<any[]>([])
const loading = ref(false)



// 格式化数值显示
const formatValue = (value: number, key: string) => {
  if (key === 'total_sales') {
    return `¥${value.toFixed(2)}`
  }
  return value.toLocaleString()
}



// 加载统计数据
const loadStatistics = async () => {
  try {
    if (!timeForm.dateRange || timeForm.dateRange.length !== 2) {
      return
    }

    const startTime = `${timeForm.dateRange[0]} 00:00:00`
    const endTime = `${timeForm.dateRange[1]} 23:59:59`

    const res: any = await getStatistics({ start_time: startTime, end_time: endTime })

    if (res.code === 0) {
      statistics.value.forEach(item => {
        if (res.data[item.key] !== undefined) {
          item.value = res.data[item.key]
        }
      })
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 加载待处理订单
const loadPendingOrders = async () => {
  loading.value = true
  try {
    const res: any = await getPendingOrders({
      page: pagination.current,
      pageSize: pagination.pageSize
    })

    if (res.code === 0) {
      pendingOrders.value = res.data.list || []
      pagination.total = res.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('获取待处理订单失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载所有数据
const loadData = () => {
  loadStatistics()
  loadPendingOrders()
}

// 日期变化
const handleDateChange = () => {
  pagination.current = 1
  loadData()
}

// 页面加载
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard {
}

.stat-card {
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-title {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.chart-card {
  height: 400px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 320px;
  color: #909399;
}

.chart-placeholder p {
  margin-top: 20px;
  font-size: 16px;
}
</style>
