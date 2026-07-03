<template>
  <div class="users">
    <el-card shadow="hover">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
       
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
       
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="user_num" label="用户编号" />
        <el-table-column prop="created_at" label="注册时间" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <!-- <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button> -->
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
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
    
        <el-form-item label="用户编号" prop="user_num">
          <el-input v-model="form.user_num" placeholder="请输入手机号" />
        </el-form-item>
        <!-- <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item> -->
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
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} from '@/api/user'

interface User {
  id?: number
  username: string
  password?: string
  phone: string
  user_num?: string
  status: string
  remark?: string
  registerTime?: string
  created_at?: string
}

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  username: '',
  phone: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const userList = ref<User[]>([])

const form = reactive<User>({
  username: '',
  password: '',
  phone: '',
  remark: '',
  status: '1'
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      pageSize: pagination.pageSize
    }
    if (searchForm.username) params.username = searchForm.username
    if (searchForm.phone) params.phone = searchForm.phone
    if (searchForm.status) params.status = searchForm.status

    const res: any = await getUserList(params)
    if (res.code === 0) {
      userList.value = res.data.list || res.data || []
      pagination.total = res.data.total || userList.value.length
    } else {
      ElMessage.error(res.message || '获取用户列表失败')
    }
  } catch (error: any) {
    console.error('获取用户列表失败:', error)
    ElMessage.error(error.response?.data?.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadUserList()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.phone = ''
  searchForm.status = ''
  pagination.current = 1
  loadUserList()
}



const handleEdit = (row: User) => {
  dialogTitle.value = '编辑用户'
  Object.assign(form, {
    user_num: row.user_num,
    id: row.id,
    username: row.username,
            phone: row.phone,
            remark: row.remark
  })
  dialogVisible.value = true
}



const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res: any
        if (form.id) {
          // 编辑用户
          const data = {
            username: form.username,
            phone: form.phone,
            user_num: form.user_num,
            remark: form.remark
          }
          res = await updateUser(form.id, data)
        } 
        if (res.code === 0) {
          ElMessage.success(form.id ? '编辑成功' : '添加成功')
          dialogVisible.value = false
          loadUserList()
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

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 页面加载时获取用户列表
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.users {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>
