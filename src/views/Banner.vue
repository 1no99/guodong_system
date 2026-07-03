<template>
  <div class="banner">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>广告图管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加广告图
          </el-button>
        </div>
      </template>

      <el-table :data="bannerList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="200">
          <template #default="{ row }">
            <el-image
              :src="getImageUrl(row.image)"
              fit="cover"
              style="width: 150px; height: 80px; border-radius: 4px;"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="sort_order" label="排序" width="80" />
       
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
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleImageChange"
          >
            <img v-if="form.image" :src="getImageUrl(form.image)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  updateBannerStatus
} from '@/api/banner'
import { uploadSysimg } from '@/api/upload'
import { getImageUrl, compressImage } from '@/utils/request'

interface Banner {
  id?: number
  title: string
  image: string
  sort_order: number
  status: number
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加广告图')
const formRef = ref<FormInstance>()

const bannerList = ref<Banner[]>([])

// 加载轮播图列表
const loadBannerList = async () => {
  loading.value = true
  try {
    const res: any = await getAllBanners()
    if (res.code === 0) {
      bannerList.value = res.data
    }
  } catch (error) {
    console.error('获取轮播图列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取轮播图列表
onMounted(() => {
  loadBannerList()
})

const form = reactive<Banner>({
  title: '',
  image: '',
  sort_order: 0,
  status: 1
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  image: [{ required: true, message: '请上传图片', trigger: 'change' }]
}

const handleAdd = () => {
  dialogTitle.value = '添加广告图'
  Object.assign(form, {
    title: '',
    image: '',
    sort_order: 0,
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row: Banner) => {
  dialogTitle.value = '编辑广告图'
  Object.assign(form, {
    ...row,
  })
  dialogVisible.value = true
}

const handleDelete = async (row: Banner) => {
  ElMessageBox.confirm('确定要删除该广告图吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteBanner(row.id!)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        loadBannerList()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}


const handleImageChange = async (file: UploadFile) => {
  if (!file.raw) return
  try {
    const compressedFile = await compressImage(file.raw as File)
    const res: any = await uploadSysimg(compressedFile)
    form.image = getImageUrl(res.data.url)
  } catch (error: any) {
    console.error('图片上传失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '图片上传失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const data = {
          title: form.title,
          image: form.image,
          sort_order: form.sort_order,
          status: form.status
        }

        let res: any
        if (form.id) {
          res = await updateBanner(form.id, data)
        } else {
          res = await createBanner(data)
        }

        if (res.code === 0) {
          ElMessage.success(form.id ? '编辑成功' : '添加成功')
          dialogVisible.value = false
          loadBannerList()
        }
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.banner {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 178px;
  height: auto;
  display: block;
  object-fit: cover;
}
</style>
