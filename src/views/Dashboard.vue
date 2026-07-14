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
    <el-card style="margin-top: 10px;" shadow="hover">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>待处理订单</span>
           <el-button type="primary"  @click="loadPendingOrders" :icon="Refresh">刷新数据</el-button>
        </div>
      </template>
       <el-table :data="pendingOrders" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div v-if="row.items && row.items.length > 0">
              <div v-if="row.total_items > 2" >
              {{ row.items[0].product_name }}... 共 {{ row.total_items }} 件商品
              </div>
              <div v-else >
               <span v-for="(value,key) of row.items" :key="key">
                {{ value.product_name }} <span v-if="key == 0">,</span>
               </span>
              </div>
            </div>
          </template>
        </el-table-column>
          <el-table-column prop="user_phone" label="下单用户电话" width="120" />
        <el-table-column prop="user_id" label="下单用户编号" width="120">
        </el-table-column>
        <el-table-column prop="total_amount" label="订单总金额" width="100">
          <template #default="{ row }">
            ¥{{ parseFloat(row.total_amount).toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="370" fixed="right">
          <template #default="{ row }">
            <el-button
              type="warning"
              size="small"
              @click="handleConfirmPayment(row)"
            >
              确认付款
            </el-button>
            <!-- <el-button
              v-if="row.order_status === 1"
              type="success"
              size="small"
              @click="handleShip(row)"
            >
              发货
            </el-button> -->
            <!-- <el-button type="primary" size="small" @click="handleView(row)">详情</el-button> -->
            <el-button  v-if="row.order_status != 4" type="primary" size="small" @click="handleView(row)">拣货清单/打印</el-button>
            <!-- <el-button
              type="danger"
              size="small"
              v-if="row.order_status != 4"
              @click="updateOrderStatusFun(row.id, 4  )"
            >
              取消订单
            </el-button> -->

          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end;"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 订单详情弹窗 -->
     <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="900px"
    >
      <div id="printArea">
        <el-descriptions :column="2" border v-if="currentOrder">
          <el-descriptions-item label="订单号">{{ currentOrder.order_no }}</el-descriptions-item>
          <el-descriptions-item label="下单用户编号">{{ currentOrder.user_id }}</el-descriptions-item>
        </el-descriptions>
        <div style="font-size: 16px;font-weight: 600;margin: 10px 0;">销售明细</div>
        <el-table :data="currentOrder?.items" v-loading="loading" style="width: 100%">
          <el-table-column prop="product_name" label="商品名称" />
          <el-table-column prop="sku_name" label="型号" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">
              ¥{{ parseFloat(row.price).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="total_price" label="合计" width="100" />
        </el-table>
        <div style="margin-top: 10px;font-size: 16px;font-weight: 600;">订单总金额金额：{{ currentOrder?.total_amount }}</div>
      </div>
      <template #footer>
        <el-button type="primary" @click="handlePrint">打印</el-button>
        <el-button type="primary" @click="handleShare(currentOrder)">分享订单信息</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStatistics, getPendingOrders } from '@/api/dashboard'
import { confirmPayment, getOrderDetail } from '@/api/order'

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

// 订单详情
const detailDialogVisible = ref(false)
const currentOrder = ref<any>(null)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 格式化数值显示
const formatValue = (value: number, key: string) => {
  if (key === 'total_sales') {
    return `¥${value.toFixed(2)}`
  }
  return value.toLocaleString()
}

// 格式化时间（北京时间）
const formatTime = (time: string | null) => {
  if (!time) return ''
  const date = new Date(time)
  const offset = 8 * 60 * 60 * 1000 // 北京时间偏移8小时
  const localDate = new Date(date.getTime() + offset)
  const year = localDate.getUTCFullYear()
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(localDate.getUTCDate()).padStart(2, '0')
  const hours = String(localDate.getUTCHours()).padStart(2, '0')
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0')
  const seconds = String(localDate.getUTCSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const getStatusName = (status: number | string) => {
  const numStatus = typeof status === 'string' ? parseInt(status) : status
  const map: Record<number, string> = {
    0: '待付款',
    1: '待发货',
    2: '已发货',
  }
  return map[numStatus] || '未知'
}

const getStatusType = (status: number | string) => {
  const numStatus = typeof status === 'string' ? parseInt(status) : status
  const map: Record<number, any> = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success',
    4: 'danger'
  }
  return map[numStatus] || 'info'
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

// 分页大小变化
const handleSizeChange = () => {
  pagination.current = 1
  loadPendingOrders()
}

// 页码变化
const handlePageChange = () => {
  loadPendingOrders()
}

// 确认付款
const handleConfirmPayment = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认要为订单 ${row.order_no} 办理付款吗？`,
      '确认付款',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res: any = await confirmPayment(row.id)
    if (res.code === 0) {
      ElMessage.success('确认付款成功')
      loadData()
    } else {
      ElMessage.error(res.message || '确认付款失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('确认付款失败:', error)
      ElMessage.error(error.response?.data?.message || '确认付款失败')
    }
  }
}

// 查看详情
const handleView = async (row: any) => {
  try {
    const res: any = await getOrderDetail(row.id)
    if (res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
  }
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
