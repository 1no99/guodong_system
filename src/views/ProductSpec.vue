<template>
  <div class="product-spec-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>商品规格配置</span>
          <el-button type="primary" @click="handleAdd">添加规格</el-button>
        </div>
      </template>

      <!-- 规格列表 -->
      <el-table :data="specs" style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="80" :index="indexMethod" />
        <el-table-column prop="spec_name" label="规格名称" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="规格名称" prop="spec_name">
          <el-input v-model="form.spec_name" placeholder="请输入规格名称，如：颜色、尺寸、重量" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getAllSpecs,
  createSpec,
  updateSpec,
  deleteSpec
} from '@/api/productSpec'

interface Spec {
  id: number
  spec_name: string
  sort_order: number
}

// 规格列表
const specs = ref<Spec[]>([])
const allSpecs = ref<Spec[]>([]) // 存储所有规格数据
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('添加规格')
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  spec_name: ''
})

const rules: FormRules = {
  spec_name: [{ required: true, message: '请输入规格名称', trigger: 'blur' }]
}

// 加载规格列表
const loadSpecs = async () => {
  loading.value = true
  try {
    const res: any = await getAllSpecs()
    console.log('规格列表响应:', res)
    if (res.code === 0) {
      allSpecs.value = res.data || []
      pagination.total = allSpecs.value.length
      updatePageData()
    } else {
      ElMessage.error(res.message || '获取规格列表失败')
    }
  } catch (error: any) {
    console.error('加载规格列表失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '加载规格列表失败')
  } finally {
    loading.value = false
  }
}

// 更新当前页数据
const updatePageData = () => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  specs.value = allSpecs.value.slice(start, end)
}

// 页码变化
const handlePageChange = (page: number) => {
  pagination.current = page
  updatePageData()
}

// 每页数量变化
const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  updatePageData()
}

// 计算序号
const indexMethod = (index: number) => {
  return (pagination.current - 1) * pagination.pageSize + index + 1
}

// 添加规格
const handleAdd = () => {
  dialogTitle.value = '添加规格'
  form.id = 0
  form.spec_name = ''
  dialogVisible.value = true
}

// 编辑规格
const handleEdit = (row: Spec) => {
  dialogTitle.value = '编辑规格'
  form.id = row.id
  form.spec_name = row.spec_name
  dialogVisible.value = true
}

// 删除规格
const handleDelete = async (row: Spec) => {
  try {
    await ElMessageBox.confirm('确定要删除该规格吗？删除后会影响已关联该规格的商品', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await deleteSpec(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      // 检查当前页是否为空，如果为空且不是第一页，则跳转到上一页
      const totalPages = Math.ceil((pagination.total - 1) / pagination.pageSize)
      if (pagination.current > totalPages && pagination.current > 1) {
        pagination.current = totalPages
      }
      await loadSpecs()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除规格失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          spec_name: form.spec_name.trim(),
          sort_order: allSpecs.value.length
        }

        let res: any
        if (form.id) {
          res = await updateSpec(form.id, data)
        } else {
          res = await createSpec(data)
        }

        if (res.code === 0) {
          ElMessage.success(form.id ? '编辑成功' : '添加成功')
          dialogVisible.value = false
          await loadSpecs()
          // 如果是添加操作，跳转到最后一页
          if (!form.id) {
            const totalPages = Math.ceil(pagination.total / pagination.pageSize)
            pagination.current = totalPages
            updatePageData()
          }
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      } catch (error: any) {
        console.error('提交失败:', error)
        ElMessage.error(error.response?.data?.message || '操作失败')
      }
    }
  })
}

onMounted(() => {
  loadSpecs()
})
</script>

<style scoped>
.product-spec-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
