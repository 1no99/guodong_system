<template>
  <div class="users">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>代客下单用户管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon>
            添加用户
          </el-button>
        </div>
      </template>

      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="120" />
        <el-table-column prop="pone" label="手机号" min-width="200" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加弹窗 -->
    <el-dialog v-model="dialogVisible" :close-on-click-modal="false" title="添加代客下单用户" width="420px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getSuperAdminList, createSuperAdmin, deleteSuperAdmin } from '@/api/user'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const userList = ref<any[]>([])
const formRef = ref<FormInstance>()

const form = reactive({
  phone: ''
})

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

const loadList = async () => {
  loading.value = true
  try {
    const res: any = await getSuperAdminList()
    if (res.code === 0) {
      userList.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  form.phone = ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    const res: any = await createSuperAdmin({ phone: form.phone })
    if (res.code === 0) {
      ElMessage.success('添加成功')
      dialogVisible.value = false
      loadList()
    }
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res: any = await deleteSuperAdmin(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadList()
    }
  }).catch(() => {})
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.users {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
