<template>
  <div class="product-spec-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>商品型号管理</span>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品ID">
          <el-input v-model="searchForm.product_id" placeholder="请输入商品ID" clearable style="width: 160px;" />
        </el-form-item>
        <el-form-item label="型号ID">
          <el-input v-model="searchForm.type_id" placeholder="请输入型号ID" clearable style="width: 160px;" />
        </el-form-item>
        <el-form-item label="型号名称">
          <el-input v-model="searchForm.type_name" placeholder="请输入型号名称" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 型号列表 -->
      <el-table :data="typeList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="型号ID" width="120" />
        <el-table-column prop="childName" label="型号名称" min-width="180">
          <template #default="{ row }">
            <span v-if="!row._editing">{{ row.childName }}</span>
            <el-input
              v-else
              v-model="row._editName"
              size="small"
              style="width: 200px;"
              @keyup.enter="handleSaveName(row)"
              @keyup.escape="handleCancelEdit(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="所属商品" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.product_name || '未知商品' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="!row._editing">
              <el-button type="primary" size="small" @click="handleEdit(row)">修改名称</el-button>
            </template>
            <template v-else>
              <el-button type="success" size="small" @click="handleSaveName(row)">保存</el-button>
              <el-button size="small" @click="handleCancelEdit(row)">取消</el-button>
            </template>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getTypeList, updateTypeName } from '@/api/productSpec'

interface TypeItem {
  id: number
  goodid: number
  childName: string
  product_name: string
  _editing?: boolean
  _editName?: string
}

const typeList = ref<TypeItem[]>([])
const loading = ref(false)

const searchForm = reactive({
  product_id: '',
  type_id: '',
  type_name: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const loadTypeList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      pageSize: pagination.pageSize
    }
    if (searchForm.product_id) params.product_id = searchForm.product_id
    if (searchForm.type_id) params.type_id = searchForm.type_id
    if (searchForm.type_name) params.type_name = searchForm.type_name

    const res: any = await getTypeList(params)
    if (res.code === 0) {
      typeList.value = (res.data.list || []).map((item: TypeItem) => ({
        ...item,
        _editing: false,
        _editName: ''
      }))
      pagination.total = res.data.pagination?.total || 0
    } else {
      ElMessage.error(res.message || '获取型号列表失败')
    }
  } catch (error: any) {
    console.error('获取型号列表失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '获取型号列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadTypeList()
}

const handleReset = () => {
  searchForm.product_id = ''
  searchForm.type_id = ''
  searchForm.type_name = ''
  pagination.current = 1
  loadTypeList()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadTypeList()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadTypeList()
}

const handleEdit = (row: TypeItem) => {
  row._editing = true
  row._editName = row.childName
}

const handleCancelEdit = (row: TypeItem) => {
  row._editing = false
  row._editName = ''
}

const handleSaveName = async (row: TypeItem) => {
  if (!row._editName || !row._editName.trim()) {
    ElMessage.warning('型号名称不能为空')
    return
  }
  if (row._editName.trim() === row.childName) {
    row._editing = false
    return
  }

  try {
    const res: any = await updateTypeName(row.id, { childName: row._editName.trim() })
    if (res.code === 0) {
      ElMessage.success('修改成功')
      row.childName = row._editName.trim()
      row._editing = false
    } else {
      ElMessage.error(res.message || '修改失败')
    }
  } catch (error: any) {
    console.error('修改型号名称失败:', error)
    ElMessage.error(error.response?.data?.message || '修改失败')
  }
}

onMounted(() => {
  loadTypeList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>
