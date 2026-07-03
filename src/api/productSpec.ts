import request from '@/utils/request'

/**
 * 获取所有规格（全局）
 */
export const getAllSpecs = () => {
  return request.get('/product-spec')
}

/**
 * 获取商品的规格列表
 */
export const getProductSpecs = (productId: number) => {
  return request.get(`/product-spec/product/${productId}`)
}

/**
 * 创建规格
 */
export const createSpec = (data: {
  spec_name: string
  sort_order?: number
  level?: number
  parent_id?: number
}) => {
  return request.post('/product-spec', data)
}

/**
 * 更新规格
 */
export const updateSpec = (id: number, data: {
  spec_name: string
  sort_order?: number
  level?: number
  parent_id?: number
}) => {
  return request.put(`/product-spec/${id}`, data)
}

/**
 * 删除规格
 */
export const deleteSpec = (id: number) => {
  return request.delete(`/product-spec/${id}`)
}

/**
 * 获取规格的所有值
 */
export const getSpecValues = (specId: number) => {
  return request.get(`/product-spec/${specId}/values`)
}

/**
 * 创建规格值
 */
export const createSpecValue = (data: {
  spec_id: number
  spec_value: string
  sort_order?: number
}) => {
  return request.post('/product-spec/values', data)
}

/**
 * 更新规格值
 */
export const updateSpecValue = (id: number, data: {
  spec_value: string
  sort_order?: number
}) => {
  return request.put(`/product-spec/values/${id}`, data)
}

/**
 * 删除规格值
 */
export const deleteSpecValue = (id: number) => {
  return request.delete(`/product-spec/values/${id}`)
}

/**
 * 为商品关联规格
 */
export const linkProductSpecs = (productId: number, specIds: number[]) => {
  return request.post(`/product-spec/product/${productId}/link`, { spec_ids: specIds })
}
