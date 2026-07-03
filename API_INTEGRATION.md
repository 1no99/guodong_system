# 前端 API 集成说明

## 已完成的 API 集成

### 1. 登录模块 (Login.vue)
- ✅ 使用 `login` API 进行用户登录
- 接口：`POST /api/user/login`
- 参数：`{ username, password }`

### 2. 地址管理 (Address.vue)
- ✅ 获取地址列表 - `GET /api/user/address`
- ✅ 创建地址 - `POST /api/user/address`
- ✅ 更新地址 - `PUT /api/user/address/:id`
- ✅ 删除地址 - `DELETE /api/user/address/:id`
- ✅ 设置默认地址 - `PUT /api/user/address/:id/default`

### 3. 订单管理 (Orders.vue)
- ✅ 获取订单列表 - `GET /api/order/list`
- ✅ 获取订单详情 - `GET /api/order/detail/:id`
- ✅ 取消订单 - `PUT /api/order/cancel/:id`
- ✅ 确认订单 - `PUT /api/order/confirm/:id`

### 4. 商品管理 (Goods.vue)
- ✅ 获取商品列表 - `GET /api/product/list`
- ✅ 搜索商品 - `GET /api/product/search`

### 5. 轮播图管理 (Banner.vue)
- ✅ 获取轮播图列表 - `GET /api/banner`

## 待后端支持的接口

以下功能前端已实现，但需要后端添加对应的管理员接口：

### 商品管理
- ⏳ 添加商品
- ⏳ 编辑商品
- ⏳ 删除商品
- ⏳ 上架/下架商品

### 轮播图管理
- ⏳ 添加轮播图
- ⏳ 编辑轮播图
- ⏳ 删除轮播图
- ⏳ 更新轮播图状态

### 用户管理
- ⏳ 获取用户列表
- ⏳ 添加用户
- ⏳ 编辑用户
- ⏳ 删除用户
- ⏳ 启用/禁用用户

### 订单管理（管理员）
- ⏳ 发货订单（目前只有用户确认收货接口）

## API 配置

API 基础路径配置在 `src/utils/request.ts`：
```typescript
baseURL: 'http://localhost:3000/api'
```

如需修改后端地址，请更新此配置。

## 数据格式说明

### 统一响应格式
```typescript
{
  code: 200,      // 状态码
  message: '',    // 消息
  data: {}        // 数据
}
```

### 分页数据格式
```typescript
{
  code: 200,
  data: {
    list: [],     // 数据列表
    total: 0,     // 总数
    page: 1,      // 当前页
    pageSize: 10  // 每页数量
  }
}
```

## Token 认证

所有需要认证的接口都会在请求头中携带 Token：
```typescript
headers: {
  Authorization: `Bearer ${token}`
}
```

Token 存储在 Pinia store 中（`stores/user.ts`），同时也持久化到 localStorage。
