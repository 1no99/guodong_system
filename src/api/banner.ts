import request from '@/utils/request'

// 前台：获取轮播图列表（只返回启用的）
export const getBannerList = () => {
  return request.get('/banner/list')
}

// 后台：获取所有轮播图（包括禁用的）
export const getAllBanners = () => {
  return request.get('/banner/admin/all')
}

// 后台：获取轮播图详情
export const getBannerDetail = (id: number) => {
  return request.get(`/banner/admin/${id}`)
}

// 后台：创建轮播图
export const createBanner = (data: any) => {
  return request.post('/banner/admin', data)
}

// 后台：更新轮播图
export const updateBanner = (id: number, data: any) => {
  return request.put(`/banner/admin/${id}`, data)
}

// 后台：删除轮播图
export const deleteBanner = (id: number) => {
  return request.delete(`/banner/admin/${id}`)
}

// 后台：更新轮播图状态
export const updateBannerStatus = (id: number, status: number) => {
  return request.put(`/banner/admin/${id}/status`, { status })
}
