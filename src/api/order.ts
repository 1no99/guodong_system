import request from '@/utils/request'

// ==================== 用户接口 ====================

// 创建订单
export const createOrder = (data: { address_id: number; items: any[]; remark?: string }) => {
  return request.post('/order/create', data)
}

// 获取我的订单列表
export const getMyOrderList = (params?: { page?: number; pageSize?: number; order_status?: string }) => {
  return request.get('/order/list', { params })
}

// 获取我的订单详情
export const getMyOrderDetail = (id: number) => {
  return request.get(`/order/detail/${id}`)
}
// 更新订单状态
export const updateOrderStatus = (id: number, order_status: number) => {
  return request.put('/order/update-status', { id, order_status })
}
// 获取订单状态统计
export const getOrderStatusCount = () => {
  return request.get('/order/status/count')
}

// ==================== 管理员接口 ====================

// 获取所有订单列表（管理员）
export const getOrderList = (params?: {
  page?: number
  pageSize?: number
  order_status?: string
  pay_status?: string
  keyword?: string
}) => {
  return request.get('/order/admin/all', { params })
}

// 获取订单详情（管理员）
export const getOrderDetail = (id: number) => {
  return request.get(`/order/admin/${id}`)
}

// 公开获取订单详情（无需登录）
export const getPublicOrderDetail = (id: number) => {
  return request.get(`/order/public/${id}`)
}

// 更新订单（管理员）
export const updateOrder = (id: number, data: {
  receiver_name?: string
  receiver_phone?: string
  receiver_address?: string
  remark?: string
}) => {
  return request.put(`/order/admin/${id}`, data)
}

// 发货（管理员）
export const shipOrder = (id: number, data: {
  express_company: string
  express_no: string
}) => {
  return request.put(`/order/admin/${id}/ship`, data)
}

// 管理员创建订单
export const createOrderByAdmin = (data: {
  username: string
  receiver_name: string
  receiver_phone: string
  receiver_address: string
  total_amount: number
  items: Array<{ product_id: number; quantity: number }>
  remark?: string
}) => {
  return request.post('/order/admin/create', data)
}

// 确认付款（管理员）
export const confirmPayment = (id: number) => {
  return request.put(`/order/admin/${id}/confirm-payment`)
}
