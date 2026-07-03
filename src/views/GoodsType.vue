<template>
  <div class="goods">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加分类
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="分类名称">
          <el-input v-model="searchForm.name" placeholder="请输入分类名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="categoryList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="分类图标" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.icon"
              :src="getImageUrl(row.icon)"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
            />
            <span v-else style="color: #ccc;">无图标</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleImageChange"
          >
            <img v-if="form.icon" :src="getImageUrl(form.icon)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
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
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/api/product'
import { uploadSysimg } from '@/api/upload'
import { getImageUrl, compressImage } from '@/utils/request'

interface Category {
  id?: number
  name: string
  parent_id: number
  icon?: string
  sort_order?: number
}

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加分类')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  name: ''
})

const categoryList = ref<Category[]>([])

// 加载分类列表
const loadCategoryList = async () => {
  loading.value = true
  try {
    const params = searchForm.name ? { name: searchForm.name } : undefined
    const res: any = await getAllCategories(params)
    if (res.code === 0) {
      categoryList.value = res.data || []
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取分类列表
onMounted(() => {
  loadCategoryList()
})

const form = reactive<Category>({
  name: '',
  parent_id: 0,
  icon: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const handleSearch = () => {
  loadCategoryList()
}

const handleReset = () => {
  searchForm.name = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '添加分类'
  Object.assign(form, {
    name: '',
    parent_id: 0,
    icon: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: Category) => {
  dialogTitle.value = '编辑分类'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = async (row: Category) => {
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteCategory(row.id!)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        loadCategoryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error: any) {
      console.error('删除失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          name: form.name,
          parent_id: form.parent_id,
          icon: form.icon || ''
        }

        let res: any
        if (form.id) {
          res = await updateCategory(form.id, data)
        } else {
          res = await createCategory(data)
        }

        if (res.code === 0) {
          ElMessage.success(form.id ? '编辑成功' : '添加成功')
          dialogVisible.value = false
          loadCategoryList()
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

const handleImageChange = async (file: UploadFile) => {
  if (!file.raw) return
  try {
    const compressedFile = await compressImage(file.raw as File)
    const res: any = await uploadSysimg(compressedFile)
    form.icon = getImageUrl(res.data.url)
  } catch (error: any) {
    console.error('图片上传失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '图片上传失败')
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.goods {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.avatar-uploader {
  display: inline-block;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}
</style>
