<template>
  <div class="orders">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <!-- <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增订单
          </el-button> -->
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="searchForm.keyword" placeholder="订单号/收货人/手机号" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.order_status" placeholder="请选择状态" clearable style="width: 200px;">
            <el-option label="全部" value="" />
            <el-option label="待付款" :value="0" />
            <el-option label="已付款待发货" :value="1" />
            <el-option label="已发货" :value="2" />
           
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch(1)">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="orderList" v-loading="loading" style="width: 100%">
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
          <el-table-column prop="userInfo.username" label="下单微信名称" width="120" />
        <el-table-column prop="user_id" label="下单用户编号" width="120">
            <template #default="{ row }">
              {{ row.user_id?row.user_id:row.user_phone.substring(6,11) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="订单总金额" width="100">
          <template #default="{ row }">
            ¥{{ parseFloat(row.total_amount).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="order_status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.order_status)">
              {{ getStatusName(row.order_status) }}
            </el-tag>
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
              v-if="row.order_status === 0"
              type="warning"
              size="small"
              @click="handleConfirmPayment(row)"
            >
              确认付款
            </el-button>
            <el-button
              v-if="row.order_status === 1"
              type="success"
              size="small"
              @click="handleShip(row)"
            >
              发货
            </el-button>
            <!-- <el-button type="primary" size="small" @click="handleView(row)">详情</el-button> -->
            <el-button  v-if="row.order_status != 4" type="primary" size="small" @click="handleView(row)">拣货清单/打印</el-button>
            <el-button
              type="danger"
              size="small"
              v-if="row.order_status != 4"
              @click="updateOrderStatusFun(row.id, 4  )"
            >
              取消订单
            </el-button>

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
        @size-change="handleSearchSizeChange"
        @current-change="handleSearch"
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
          <el-descriptions-item label="下单用户编号">{{ currentOrder.user_phone?.substring(6, 11) }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ currentOrder.receiver_name }}</el-descriptions-item>
          <el-descriptions-item label="收货人电话">{{ currentOrder.receiver_phone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ currentOrder.receiver_address }}</el-descriptions-item>
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

    <!-- 发货弹窗 -->
    <el-dialog
      v-model="shipDialogVisible"
      title="订单发货"
      width="500px"
      @close="handleCloseShipDialog"
    >
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="快递公司">
          <el-select v-model="shipForm.express_company" placeholder="请选择快递公司" style="width: 100%">
            <el-option
              v-for="item in expressCompanies"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="shipForm.express_no" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseShipDialog">取消</el-button>
        <el-button type="primary" @click="confirmShip">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增订单弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增订单"
      width="800px"
      @close="handleCloseAddDialog"
    >
      <el-form :model="orderForm" :rules="orderRules" ref="orderFormRef" label-width="100px">
        <el-form-item label="用户电话" prop="receiver_name">
          <el-input v-model="orderForm.receiver_name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="receiver_phone">
          <el-input v-model="orderForm.receiver_phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="收货地址" prop="receiver_address">
          <el-input v-model="orderForm.receiver_address" placeholder="请输入收货地址" />
        </el-form-item>

        <!-- 商品列表 -->
        <el-form-item label="商品列表">
          <div v-for="(item, index) in orderForm.items" :key="index" style="margin-bottom: 10px; border: 1px solid #eee; padding: 10px; border-radius: 4px;">
            <div style="display: flex; gap: 10px; align-items: center;">
              <div style="flex: 1;">
                <el-select
                  v-model="item.product_id"
                  filterable
                  remote
                  reserve-keyword
                  placeholder="请搜索商品名称或ID"
                  :remote-method="searchProducts"
                  :loading="productLoading"
                  style="width: 200px"
                  @change="handleProductChange(index)"
                >
                  <el-option
                    v-for="product in productList"
                    :key="product.id"
                    :label="`${product.name} (ID: ${product.id})`"
                    :value="product.id"
                  />
                </el-select>
              </div>
              <div>
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  placeholder="数量"
                  style="width: 100px"
                  @change="handleQuantityChange(index)"
                />
              </div>
              <div>
                <span style="color: #999; font-size: 14px;">
                  小计: ¥{{ (item.price * item.quantity).toFixed(2) }}
                </span>
              </div>
              <div>
                <el-button type="danger" size="small" @click="removeItem(index)" :disabled="orderForm.items.length <= 1">删除</el-button>
              </div>
            </div>
          </div>
          <el-button type="primary" size="" @click="addItem" style="margin-left:15px">+ 添加商品</el-button>
        </el-form-item>

        <el-form-item label="订单金额" prop="total_amount">
          <el-input-number style="width: 200px;" v-model="orderForm.total_amount" :min="0" :precision="2" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseAddDialog">取消</el-button>
        <el-button type="primary" @click="confirmAddOrder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getOrderList,
  getOrderDetail,
  shipOrder,
  updateOrderStatus,
  createOrderByAdmin,
  confirmPayment
} from '@/api/order'
import { getAllProducts } from '@/api/product'

interface OrderItem {
  product_id: number
  product_name: string
  product_image: string
  price: string
  quantity: number
}

interface Order {
  id: number
  order_no: string
  user_id: number
  total_amount: number
  pay_amount: number
  pay_type: string | null
  pay_status: number
  order_status: number
  receiver_name: string
  receiver_phone: string
  receiver_address: string
  created_at: string
  pay_time: string | null
  items?: OrderItem[]
  total_items?: number
  username?: string
  nickname?: string
  user_phone?: string
  currentOrder: any
}

const loading = ref(false)
const detailDialogVisible = ref(false)
const shipDialogVisible = ref(false)
const addDialogVisible = ref(false)
const currentOrder = ref<Order | null>(null)
const orderFormRef = ref<FormInstance>()

const shipForm = reactive({
  express_company: '',
  express_no: ''
})

const expressCompanies = [
  { label: '中通快运', value: '中通快运' },
  { label: '顺丰速运', value: '顺丰速运' },
  { label: '中通快递', value: '中通快递' },
  { label: '圆通速递', value: '圆通速递' },
  { label: '申通快递', value: '申通快递' },
  { label: '韵达快递', value: '韵达快递' },
  { label: '极兔速递', value: '极兔速递' },
  { label: '邮政EMS', value: '邮政EMS' },
  { label: '德邦快递', value: '德邦快递' },
  { label: '京东快递', value: '京东快递' },
]

const orderForm = reactive({
  receiver_name: '',
  receiver_phone: '',
  receiver_address: '',
  items: [{ product_id: null as number | null, quantity: 1, price: 0 }],
  total_amount: 0
})

const productList = ref<any[]>([])
const productLoading = ref(false)

const orderRules: FormRules = {
  receiver_name: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  receiver_phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  receiver_address: [{ required: true, message: '请输入收货地址', trigger: 'blur' }],
  total_amount: [{ required: true, message: '请输入订单金额', trigger: 'blur' }]
}

const searchForm = reactive({
  keyword: '',
  order_status: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const orderList = ref<Order[]>([])
const handleShare = (row: any) => {
  const url = `${window.location.origin}/order/share/${row.id}`
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('分享链接已复制到剪贴板')
    })
  } else {
    // fallback
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    ElMessage.success('分享链接已复制到剪贴板')
  }
}

const updateOrderStatusFun = async (id: number, status: number) => {
  try {
    const res: any = await updateOrderStatus(id, status)
    if (res.code === 0) {
      ElMessage.success('订单状态更新成功')
      loadOrderList()
    } else {
      ElMessage.error(res.message || '订单状态更新失败')
    }
  } catch (error) {
    console.error('更新订单状态失败:', error)
    ElMessage.error('更新订单状态失败')
  }
}

// 加载订单列表
const loadOrderList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      pageSize: pagination.pageSize
    }

    if (searchForm.keyword) {
      params.keyword = searchForm.keyword
    }

    if (searchForm.order_status !== '') {
      params.order_status = searchForm.order_status
    }

    const res: any = await getOrderList(params)

    if (res.code === 0) {
      orderList.value = res.data.list || []
      pagination.total = res.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取订单列表
onMounted(() => {
  loadOrderList()
})

const formatTime = (time: string | null) => {
  if (!time) return ''
  // 处理UTC时间并转换为北京时间（UTC+8）
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
    4: '已取消'
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
    4: 'info'
  }
  return map[numStatus] || 'info'
}



const handleSearch = (val:any) => {
  pagination.current = val
  loadOrderList()
}
const handleSearchSizeChange = (val:any) => {
  pagination.pageSize = val
  pagination.current = 1
  loadOrderList()
}


const handleReset = () => {
  searchForm.keyword = ''
  searchForm.order_status = ''
  pagination.current = 1
  loadOrderList()
}

const handleView = async (row: Order) => {
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

const handlePrint = () => {
  const printContent = document.getElementById('printArea')
  if (!printContent) return

  const printWindow = window.open('', '_blank', 'width=900,height=700')
  printWindow?.document.write(`
    <html>
    <head>
      <title>订单详情 - ${currentOrder.value?.order_no || ''}</title>
      <style>
        body { font-family: "Microsoft YaHei", sans-serif; padding: 20px; }
        .el-descriptions { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .el-descriptions td, .el-descriptions th {
          border: 1px solid #dcdfe6; padding: 8px 12px; font-size: 14px;
        }
        .el-descriptions th { background-color: #f5f7fa; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table th, table td { border: 1px solid #dcdfe6; padding: 8px 12px; text-align: left; font-size: 14px; }
        table th { background-color: #f5f7fa; font-weight: 600; }
        .section-title { font-size: 16px; font-weight: 600; margin: 10px 0; }
        .total-amount { margin-top: 10px; font-size: 16px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div style="text-align:center;font-size:18px;font-weight:700;margin-bottom:15px;">订单详情</div>
      ${printContent.innerHTML}
    </body>
    </html>
  `)
  printWindow?.document.close()
  printWindow?.focus()
  printWindow?.print()
  printWindow?.close()
}

const handleShip = (row: Order) => {
  currentOrder.value = row
  shipForm.express_company = ''
  shipForm.express_no = ''
  shipDialogVisible.value = true
}

const confirmShip = async () => {
  if (!shipForm.express_company || !shipForm.express_no) {
    ElMessage.warning('请填写快递公司和快递单号')
    return
  }

  try {
    const res: any = await shipOrder(currentOrder.value!.id, shipForm)
    if (res.code === 0) {
      ElMessage.success('发货成功')
      shipDialogVisible.value = false
      loadOrderList()
    } else {
      ElMessage.error(res.message || '发货失败')
    }
  } catch (error: any) {
    console.error('发货失败:', error)
    ElMessage.error(error.response?.data?.message || '发货失败')
  }
}

const handleCloseShipDialog = () => {
  shipDialogVisible.value = false
  shipForm.express_company = ''
  shipForm.express_no = ''
}

const handleConfirmPayment = async (row: Order) => {
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
      loadOrderList()
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

const handleAdd = () => {
  Object.assign(orderForm, {
    receiver_name: '',
    receiver_phone: '',
    receiver_address: '',
    items: [{ product_id: null as number | null, quantity: 1, price: 0 }],
    total_amount: 0
  })
  productList.value = []
  addDialogVisible.value = true
}

const handleCloseAddDialog = () => {
  addDialogVisible.value = false
  orderFormRef.value?.resetFields()
}

// 搜索商品
const searchProducts = async (query: string) => {
  if (!query) {
    productList.value = []
    return
  }

  productLoading.value = true
  try {
    const res: any = await getAllProducts({
      keyword: query,
      page: 1,
      pageSize: 20
    })

    if (res.code === 0) {
      productList.value = res.data.list || []
    }
  } catch (error) {
    console.error('搜索商品失败:', error)
  } finally {
    productLoading.value = false
  }
}

const confirmAddOrder = async () => {
  if (!orderFormRef.value) return

  await orderFormRef.value.validate(async (valid) => {
    if (valid) {
      // 验证商品列表
      if (orderForm.items.length === 0) {
        ElMessage.warning('请至少添加一个商品')
        return
      }

      for (let i = 0; i < orderForm.items.length; i++) {
        if (!orderForm.items[i].product_id) {
          ElMessage.warning(`请选择第 ${i + 1} 个商品`)
          return
        }
        if (orderForm.items[i].quantity < 1) {
          ElMessage.warning(`第 ${i + 1} 个商品数量必须大于0`)
          return
        }
      }

      try {
        const data = {
          username: 'admin',
          receiver_name: orderForm.receiver_name,
          receiver_phone: orderForm.receiver_phone,
          receiver_address: orderForm.receiver_address,
          total_amount: orderForm.total_amount,
          items: orderForm.items.map(item => ({
            product_id: item.product_id!,
            quantity: item.quantity
          }))
        }

        const res: any = await createOrderByAdmin(data)
        if (res.code === 0) {
          ElMessage.success('新增订单成功')
          addDialogVisible.value = false
          orderFormRef.value?.resetFields()
          loadOrderList()
        } else {
          ElMessage.error(res.message || '新增订单失败')
        }
      } catch (error: any) {
        console.error('新增订单失败:', error)
        ElMessage.error(error.response?.data?.message || '新增订单失败')
      }
    }
  })
}

// 计算订单金额
const calculateTotalAmount = () => {
  orderForm.total_amount = orderForm.items.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
}

// 添加商品
const addItem = () => {
  orderForm.items.push({ product_id: null as number | null, quantity: 1, price: 0 })
}

// 删除商品
const removeItem = (index: number) => {
  if (orderForm.items.length > 1) {
    orderForm.items.splice(index, 1)
    calculateTotalAmount()
  }
}

// 商品选择变化
const handleProductChange = (index: number) => {
  const selectedItem = orderForm.items[index]
  const product = productList.value.find(p => p.id === selectedItem.product_id)
  if (product) {
    selectedItem.price = parseFloat(product.price) || 0
    calculateTotalAmount()
  }
}

// 数量变化
const handleQuantityChange = (index: number) => {
  if (orderForm.items[index].quantity < 1) {
    orderForm.items[index].quantity = 1
  }
  calculateTotalAmount()
}
</script>

<style scoped>
.orders {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>
