<template>
  <div class="order-share">
    <!-- 加载 -->
    <div v-if="loading" v-loading="loading" style="min-height: 200px;" />

    <template v-else-if="order">
      <!-- 订单信息 -->
      <div class="section">
        <div class="section-title">订单信息</div>
        <div class="info-row"><span class="label">订单号：</span>{{ order.order_no }}</div>
        <div class="info-row"><span class="label">下单人编号：</span>{{ order.user_phone?.substring(6, 11) }}</div>
        <div class="info-row"><span class="label">收货人：</span>{{ order.receiver_name }} {{ order.receiver_phone }}</div>
        <div class="info-row"><span class="label">收货地址：</span>{{ order.receiver_address }}</div>

        <!-- <div class="info-row"><span class="label">地址：</span>{{ order.receiver_address }}</div> -->
        <!-- <div class="info-row">
          <span class="label">总金额：</span>
          <span class="total-price">¥{{ parseFloat(order.total_amount).toFixed(2) }}</span>
        </div> -->
      </div>

      <!-- 未拣货 -->
      <div class="section">
        <div class="section-title">
          未拣货
          <span class="tag tag-danger">待拣货 {{ unpickedItems.length }} 件</span>
        </div>
        <div v-if="unpickedItems.length === 0" class="empty-hint">所有商品已拣货</div>
        <div v-for="(item, idx) in unpickedItems" :key="'unpick-' + idx" class="pick-item" style="display: flex;">
            <div style="width: 25%;cursor: pointer;" @click="openPreview(item.product_image)">
              <img :src="item.product_image" :alt="item.product_name" style="width: 4rem; height: 4rem; object-fit: cover;"></div>
          <div class="item-top" style="width: 50%;">
            <div class="item-name">{{ item.product_name }}</div>
            <div v-if="item.sku_name" class="item-sku">规格：{{ item.sku_name }}</div>
            <div v-if="item.quantity" class="item-sku">数量：{{ item.quantity }}</div>
          </div>
          <div style="width: 25%;" class="item-bottom">
            <div style="height: 2rem;background-color: #4099ef;padding: 10px;line-height: 0.8rem;
            text-align: center;border-radius: 10px;color: #fff;cursor: pointer;
            " 
            @click="pickItem(item._index)">
                确认拣货
            </div>
            <!-- <el-button type="success" size="small" class="pick-btn" @click="pickItem(item._index)"></el-button> -->
          </div>
        </div>
      </div>

      <!-- 已拣货 -->
      <div class="section">
        <div class="section-title">
          已拣货
          <span class="tag tag-success">已拣货 {{ pickedItems.length }} 件</span>
        </div>
        <div v-if="pickedItems.length === 0" class="empty-hint">暂无已拣货商品</div>
        <div v-for="(item, idx) in pickedItems" :key="'pick-' + idx" class="pick-item picked" style="display: flex;">
          <div style="width: 25%;cursor: pointer;" @click="openPreview(item.spec_type_image)">
            <img :src="item.product_image" :alt="item.product_name" style="width: 4rem; height: 4rem; object-fit: cover;"></div>
          <div class="item-top" style="width: 50%;">
            <div class="item-name">{{ item.product_name }}</div>
            <div v-if="item.sku_name" class="item-sku">规格：{{ item.sku_name }}</div>
            <div v-if="item.quantity" class="item-sku">数量：{{ item.quantity }}</div>
          </div>
          <div style="width: 25%;" class="item-bottom">
            <div style="height: 2rem;background-color: #ccc;padding: 10px;line-height: 0.8rem;
            text-align: center;border-radius: 10px;color: #fff;cursor: pointer;
            " 
            @click="unpickItem(item._index)">
                取消拣货
            </div>
            <!-- <el-button type="success" size="small" class="pick-btn" @click="pickItem(item._index)"></el-button> -->
          </div>
        </div>
      </div>
    </template>

    <div v-else class="empty-hint" style="margin-top:60px;">订单不存在</div>

    <!-- 图片预览遮罩层 -->
    <div v-if="previewVisible" class="image-preview-overlay" @click="previewVisible = false">
      <img :src="previewSrc" class="image-preview-img" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPublicOrderDetail } from '@/api/order'

const route = useRoute()
const loading = ref(true)
const order = ref<any>(null)
const pickedIndices = ref<Set<number>>(new Set())
const previewVisible = ref(false)
const previewSrc = ref('')

const STORAGE_KEY = 'order_pick_status'

const openPreview = (src: string) => {
  if (!src) return
  previewSrc.value = src
  previewVisible.value = true
}

const loadPickStatus = (orderId: number) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    if (all[orderId]) {
      pickedIndices.value = new Set(all[orderId])
    }
  } catch {
    pickedIndices.value = new Set()
  }
}

const savePickStatus = (orderId: number) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    all[orderId] = Array.from(pickedIndices.value)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}

// 给每个 item 附加原始索引 _index
const itemsWithIndex = computed(() => {
  if (!order.value?.items) return []
  return order.value.items.map((item: any, i: number) => ({ ...item, _index: i }))
})

const unpickedItems = computed(() => {
  return itemsWithIndex.value.filter((item: any) => !pickedIndices.value.has(item._index))
})

const pickedItems = computed(() => {
  return itemsWithIndex.value.filter((item: any) => pickedIndices.value.has(item._index))
})

const pickItem = (index: number) => {
  pickedIndices.value.add(index)
  pickedIndices.value = new Set(pickedIndices.value)
  savePickStatus(order.value.id)
}

const unpickItem = (index: number) => {
  pickedIndices.value.delete(index)
  pickedIndices.value = new Set(pickedIndices.value)
  savePickStatus(order.value.id)
}

const formatTime = (time: string | null) => {
  if (!time) return ''
  const date = new Date(time)
  const offset = 8 * 60 * 60 * 1000
  const localDate = new Date(date.getTime() + offset)
  const y = localDate.getUTCFullYear()
  const m = String(localDate.getUTCMonth() + 1).padStart(2, '0')
  const d = String(localDate.getUTCDate()).padStart(2, '0')
  const h = String(localDate.getUTCHours()).padStart(2, '0')
  const mi = String(localDate.getUTCMinutes()).padStart(2, '0')
  const s = String(localDate.getUTCSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${mi}:${s}`
}

const getStatusName = (status: number) => {
  const map: Record<number, string> = { 0: '待付款', 1: '待发货', 2: '已发货', 4: '已取消' }
  return map[status] || '未知'
}

const getStatusType = (status: number) => {
  const map: Record<number, any> = { 0: 'warning', 1: 'primary', 2: 'info', 4: 'info' }
  return map[status] || 'info'
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) { loading.value = false; return }
  try {
    const res: any = await getPublicOrderDetail(id)
    if (res.code === 0) {
      order.value = res.data
      loadPickStatus(id)
    }
  } catch (e) {
    console.error('获取订单详情失败:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.order-share {
  max-width: 600px;
  margin: 0 auto;
  padding: 12px;
  font-size: 14px;
  background: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 400;
}
.tag-danger { background: #fef0f0; color: #f56c6c; }
.tag-success { background: #f0f9eb; color: #67c23a; }

.info-row {
  padding: 6px 0;
  line-height: 1.6;
  word-break: break-all;
}
.label {
  color: #999;
  flex-shrink: 0;
}
.total-price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.pick-item {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
}
.pick-item.picked {
  background: #f0f9eb;
  border-color: #c2e7b0;
}

.item-top {
  
}
.item-name {
  font-weight: 500;
  font-size: 18px;
  flex: 1;
}
.item-sku {
  font-size: 14px;
  color: #999;
}

.item-bottom {
  display: flex;
  align-items: center;
  gap: 10px;
}
.item-price {
  color: #f56c6c;
  font-weight: 500;
}
.item-qty {
  color: #666;
}
.pick-btn {
  margin-left: auto;
}

.empty-hint {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 13px;
}

.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}
.image-preview-img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 6px;
}
</style>
