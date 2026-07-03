<template>
  <div class="address">
    <el-card shadow="hover">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.userName" placeholder="请输入用户名" clearable />
        </el-form-item>
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

      <el-table :data="addressList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userName" label="收货人" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="province" label="省份" width="100" />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="district" label="区县" width="100" />
        <el-table-column prop="detailAddress" label="详细地址" />
        <el-table-column prop="isDefault" label="默认" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isDefault" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
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
        <el-form-item label="收货人" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="省市区" prop="region">
          <el-cascader
            v-model="form.region"
            :options="regionOptions"
            :props="{ expandTrigger: 'hover' }"
            placeholder="请选择省市区"
            style="width: 100%"
            @change="handleRegionChange"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input
            v-model="form.detailAddress"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
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
  getAddressList,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '@/api/user'

interface Address {
  id?: number
  userId: number
  userName: string
  phone: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault: boolean
  region?: string[]
}

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加地址')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  userName: '',
  phone: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const regionOptions = [
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '市辖区',
        label: '市辖区',
        children: [
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' },
          { value: '朝阳区', label: '朝阳区' },
          { value: '海淀区', label: '海淀区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '市辖区',
        label: '市辖区',
        children: [
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '浦东新区', label: '浦东新区' }
        ]
      }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '天河区', label: '天河区' },
          { value: '越秀区', label: '越秀区' },
          { value: '海珠区', label: '海珠区' }
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '南山区', label: '南山区' },
          { value: '福田区', label: '福田区' },
          { value: '罗湖区', label: '罗湖区' }
        ]
      }
    ]
  }
]

const addressList = ref<Address[]>([])

// 加载地址列表
const loadAddressList = async () => {
  loading.value = true
  try {
    const res: any = await getAddressList()
    if (res.code === 0) {
      addressList.value = res.data
      pagination.total = res.data.length
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取地址列表
onMounted(() => {
  loadAddressList()
})

const form = reactive<Address>({
  userId: 1,
  userName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false,
  region: []
})

const rules: FormRules = {
  userName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  region: [{ required: true, message: '请选择省市区', trigger: 'change' }],
  detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const handleSearch = () => {
  loadAddressList()
}

const handleReset = () => {
  searchForm.userName = ''
  searchForm.phone = ''
  loadAddressList()
}

const handleAdd = () => {
  dialogTitle.value = '添加地址'
  Object.assign(form, {
    userId: 1,
    userName: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    isDefault: false,
    region: []
  })
  dialogVisible.value = true
}

const handleEdit = (row: Address) => {
  dialogTitle.value = '编辑地址'
  Object.assign(form, {
    ...row,
    region: [row.province, row.city, row.district]
  })
  dialogVisible.value = true
}

const handleDelete = async (row: Address) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteAddress(row.id!)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        loadAddressList()
      }
    } catch (error) {
      console.error('删除地址失败:', error)
    }
  })
}

const handleRegionChange = (value: string[]) => {
  if (value && value.length === 3) {
    form.province = value[0]
    form.city = value[1]
    form.district = value[2]
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          user_name: form.userName,
          phone: form.phone,
          province: form.province,
          city: form.city,
          district: form.district,
          detail_address: form.detailAddress,
          is_default: form.isDefault ? 1 : 0
        }

        let res: any
        if (form.id) {
          res = await updateAddress(form.id, data)
        } else {
          res = await createAddress(data)
        }

        if (res.code === 0) {
          ElMessage.success(form.id ? '编辑成功' : '添加成功')
          dialogVisible.value = false
          loadAddressList()
        }
      } catch (error) {
        console.error('提交地址失败:', error)
      }
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.address {
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
