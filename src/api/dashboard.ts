import request from '@/utils/request'

// 获取统计数据
export const getStatistics = (params: {
  start_time: string
  end_time: string
}) => {
  return request.get('/dashboard/statistics', { params })
}

// 获取待处理订单列表（待付款订单）
export const getPendingOrders = (params: {
  start_time?: string
  end_time?: string
  page?: number
  pageSize?: number
}) => {
  return request.get('/dashboard/pending-orders', { params })
}
