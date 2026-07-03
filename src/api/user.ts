import request from '@/utils/request'

// 用户登录
export const login = (data: { username: string; password: string }) => {
  return request.post('/user/login', data)
}

// 用户注册
export const register = (data: { username: string; phone: string; password: string }) => {
  return request.post('/user/register', data)
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/user/info')
}

// 更新用户信息
export const updateUserInfo = (data: any) => {
  return request.put('/user/info', data)
}

// 获取地址列表
export const getAddressList = () => {
  return request.get('/user/address')
}

// 获取地址详情
export const getAddressDetail = (id: number) => {
  return request.get(`/user/address/${id}`)
}

// 创建地址
export const createAddress = (data: any) => {
  return request.post('/user/address', data)
}

// 更新地址
export const updateAddress = (id: number, data: any) => {
  return request.put(`/user/address/${id}`, data)
}

// 删除地址
export const deleteAddress = (id: number) => {
  return request.delete(`/user/address/${id}`)
}

// 设置默认地址
export const setDefaultAddress = (id: number) => {
  return request.put(`/user/address/${id}/default`)
}

// ============ 管理员用户管理接口 ============

// 获取用户列表（管理员）
export const getUserList = (params?: {
  page?: number
  pageSize?: number
  username?: string
  phone?: string
  status?: string
}) => {
  return request.get('/user/admin/users', { params })
}

// 创建用户（管理员）
export const createUser = (data: {
  username: string
  password: string
  phone: string
  status?: string
  remark?: string
}) => {
  return request.post('/user/admin/users', data)
}

// 更新用户信息（管理员）
export const updateUser = (id: number, data: {
  username?: string
  phone?: string
  status?: string
  remark?: string
}) => {
  return request.put(`/user/admin/users/${id}`, data)
}

// 删除用户（管理员）
export const deleteUser = (id: number) => {
  return request.delete(`/user/admin/users/${id}`)
}

// 启用/禁用用户（管理员）
export const toggleUserStatus = (id: number, status: string) => {
  return request.put(`/user/admin/users/${id}/status`, { status })
}

// 重置用户密码（管理员）
export const resetUserPassword = (id: number, password: string) => {
  return request.put(`/user/admin/users/${id}/password`, { password })
}
