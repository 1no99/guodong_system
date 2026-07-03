import request from '@/utils/request'

// 获取购物车列表
export const getCartList = () => {
  return request.get('/cart/list')
}

// 添加到购物车
export const addToCart = (productId: number, quantity?: number) => {
  return request.post('/cart/add', { product_id: productId, quantity: quantity || 1 })
}

// 更新购物车商品数量
export const updateCartItem = (id: number, quantity: number) => {
  return request.put(`/cart/item/${id}`, { quantity })
}

// 从购物车移除商品
export const removeFromCart = (id: number) => {
  return request.delete(`/cart/item/${id}`)
}

// 批量移除购物车商品
export const batchRemoveCart = (ids: number[]) => {
  return request.delete('/cart/batch', { data: { ids } })
}

// 清空购物车
export const clearCart = () => {
  return request.delete('/cart/clear')
}

// 获取购物车商品数量
export const getCartCount = () => {
  return request.get('/cart/count')
}
