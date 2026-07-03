import request from '@/utils/request'

// 获取商品列表
export const getProductList = (params?: { page?: number; pageSize?: number; category_id?: number }) => {
  return request.get('/product/list', { params })
}

// 获取商品详情
export const getProductDetail = (id: number) => {
  return request.get(`/product/detail/${id}`)
}

// 搜索商品
export const searchProducts = (params: { keyword: string; page?: number; pageSize?: number }) => {
  return request.get('/product/search', { params })
}

// 获取分类列表
export const getCategoryList = () => {
  return request.get('/product/category/list')
}

// 获取分类树
export const getCategoryTree = () => {
  return request.get('/product/category/tree')
}

// 获取分类详情
export const getCategoryDetail = (id: number) => {
  return request.get(`/product/category/${id}`)
}

// ==================== 分类管理接口 ====================

// 后台：获取所有分类（包括禁用的）
export const getAllCategories = (params?: { name?: string }) => {
  return request.get('/product/category/admin/all', { params })
}

// 后台：创建分类
export const createCategory = (data: any) => {
  return request.post('/product/category/admin', data)
}

// 后台：更新分类
export const updateCategory = (id: number, data: any) => {
  return request.put(`/product/category/admin/${id}`, data)
}

// 后台：删除分类
export const deleteCategory = (id: number) => {
  return request.delete(`/product/category/admin/${id}`)
}

// ==================== 后台管理接口 ====================

// 后台：获取所有商品（包括禁用的）
export const getAllProducts = (params?: { page?: number; pageSize?: number; category_id?: number; keyword?: string }) => {
  return request.get('/product/admin/all', { params })
}

// 后台：获取商品详情（含规格）
export const getAdminProductDetail = (id: number) => {
  return request.get(`/product/admin/${id}`)
}

// 后台：创建商品
export const createProduct = (data: any) => {
  return request.post('/product/admin', data)
}

// 后台：更新商品
export const updateProduct = (id: number, data: any) => {
  return request.put(`/product/admin/${id}`, data)
}

// 后台：删除商品
export const deleteProduct = (id: number) => {
  return request.delete(`/product/admin/${id}`)
}

// 后台：更新商品状态
export const updateProductStatus = (id: number, status: number) => {
  return request.put(`/product/admin/${id}/status`, { status })
}

// 获取收藏列表
export const getFavoriteList = () => {
  return request.get('/product/favorite/list')
}

// 添加收藏
export const addFavorite = (productId: number) => {
  return request.post('/product/favorite/add', { product_id: productId })
}

// 取消收藏
export const removeFavorite = (productId: number) => {
  return request.delete(`/product/favorite/${productId}`)
}

// 检查是否收藏
export const checkFavorite = (productId: number) => {
  return request.get(`/product/favorite/check/${productId}`)
}
