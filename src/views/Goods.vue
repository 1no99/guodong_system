<template>
  <div class="goods">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon>
            添加商品
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category_id" style="width: 200px;" placeholder="请选择分类" clearable>
            <el-option label="全部" :value="0" />
            <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="goodsList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品图片" width="100">
          <template #default="{ row }">
            <el-image :src="getImageUrl(row.main_image)" fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="subtitle" label="副标题" show-overflow-tooltip />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            {{ getCategoryName(row.category_id) }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="规格" width="200">
          <template #default="{ row }">
            {{ getSpecNames(row.spec_ids) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" >
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" /> -->
        <!-- <el-table-column prop="sales" label="库存" /> -->

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end;" @size-change="handlePageSizeChange"
        @current-change="handlePageChange" />
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :title="dialogTitle" width="1100px" top="5vh"
      @close="handleDialogClose">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="副标题" prop="subtitle">
          <el-input v-model="form.subtitle" placeholder="请输入副标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择分类" style="width: 100%;">
            <el-option label="请选择分类" :value="0" />
            <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品主图" prop="main_image">
          <el-upload class="avatar-uploader" action="#" :show-file-list="false" :auto-upload="false"
            :on-change="handleImageChange">
            <img v-if="form.main_image" :src="getImageUrl(form.main_image)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品详情图">
          <div class="detail-images-uploader">
            <div v-for="(_image, index) in 5" :key="index" class="image-upload-item">
              <el-upload class="avatar-uploader" action="#" :show-file-list="false" :auto-upload="false"
                :on-change="(file: UploadFile) => handleDetailImageChange(file, index)">
                <img v-if="getDetailImageUrl(index)" :src="getImageUrl(getDetailImageUrl(index))"
                  class="detail-avatar" />
                <el-icon v-else class="avatar-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
              <div class="image-label">图片{{ index + 1 }}</div>
              <el-button v-if="getDetailImageUrl(index)" type="danger" size="small" @click="removeDetailImage(index)"
                style="margin-top: 4px">
                删除
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="商品规格" prop="spec_ids">
          <el-button type="primary" @click="dialogVisible_type = true,dynamicTags2 = [],dynamicTags = []">配置规格</el-button>
          <el-button type="primary" @click="opendio">一键配置（价格/库存）</el-button>
        </el-form-item>
        <el-form-item label="商品规格" prop="spec_ids">
          <el-table :data="tableData" style="width: 100%" border :span-method="spanMethod">
            <el-table-column prop="parentName" label="颜色类型" />
            <el-table-column prop="childName" label="规格尺码" />
            <el-table-column prop="price" label="价格">
              <template #default="{ row }">
                <el-input v-model="row.price" placeholder="请输入价格" />
              </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存">
              <template #default="{ row }">
                <el-input v-model="row.stock" placeholder="请输入库存" />
              </template>
            </el-table-column>
            <el-table-column prop="typeimg" label="花色图">
              <template #default="{ row }">
                <el-upload style="width: 50px;height: 50px;border: 1px solid #ccc;
                    text-align: center;line-height: 50px;cursor: pointer;border-radius: 10px;" action="#"
                  :show-file-list="false" :auto-upload="false"
                  :on-change="(file: UploadFile) => tabTypeimg(file, 0, row)">
                  <img v-if="row.typeimg" :src="getImageUrl(row.typeimg)" class="avatar" />
                  <el-icon v-else>
                    <Plus />
                  </el-icon>
                </el-upload>
              </template>
            </el-table-column>
            <el-table-column prop="" label="操作" width="100">
              <template #default="{ row }">
                <el-button type="danger" @click="handleDeleteSpec(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog :close-on-click-modal="false" v-model="dialogVisible_type" title="规格配置" width="700px">
      <h3 >规格尺码 </h3>
      <div style="margin: 10px 0;">
        <el-tag size="large" v-for="tag of dynamicTags2" :key="tag" closable style="margin: 10px 10px 0 0px;"
          :disable-transitions="false" @close="handleClose(tag, 2)">
          {{ tag.spec_name }}
        </el-tag>
      </div>
      <div> <el-input v-model="tagInput2" style="width: 400px" clearable placeholder="请输入颜色类型（支持批量填写如：红色, 蓝色, 绿色）" />
        <el-button style="margin-left: 10px;" type="primary" @click="addtabInfo(2)">确定</el-button>
      </div>
      <h3 style="margin-top: 10px;">颜色类型</h3>
      <div style="margin: 10px 0;">
        <el-tag size="large" v-for="tag of dynamicTags" :key="tag" closable style="margin: 10px 10px 0 0px;"
          :disable-transitions="false" @close="handleClose(tag, 1)">
          {{ tag.spec_name }}
        </el-tag>
      </div>
      <div> <el-input v-model="tagInput" style="width: 400px" clearable placeholder="请输入规格尺码（支持批量填写如：S, M, L）" />
        <el-button style="margin-left: 10px;" type="primary" @click="addtabInfo(1)">确定</el-button>
      </div>
      <!-- <el-select v-model="form_type.ggcm" filterable placeholder="请选择分类" clearable multiple>
            <el-option :label="value.spec_name" :value="value.spec_name"  v-for="value in specList" />
          </el-select> -->


      <!-- <el-select v-model="form_type.colortype" filterable placeholder="请选择分类" clearable multiple>
            <el-option :label="value.spec_name" :value="value.spec_name"  v-for="value in specList" />
          </el-select> -->

      <template #footer>
        <el-button @click="dialogVisible_type = false">取消</el-button>
        <el-button type="primary" @click="SubmitType">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog :close-on-click-modal="false" v-model="dialogVisible_Money" title="价格配置" width="700px">
      <el-form :model="form_Money" ref="formRef" label-width="100px">
        <el-form-item label="需配置的类型" prop="name">
          <el-select v-model="form_Money.type" placeholder="请选择分类" clearable>
            <el-option label="价格" value="1" />
            <el-option label="库存" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置层级" prop="name">
          <el-select v-model="form_Money.typecg" placeholder="请选择分类" @change="getgoodtypelist" clearable>
            <el-option label="按颜色类型" value="1" />
            <el-option label="按规格尺码" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置详情项" prop="name">
          <el-select v-model="form_Money.systemdetil" placeholder="请选择分类" clearable>
            <el-option :label="item" v-for="(item, key) in optionList" :value="item" :key="key" />
          </el-select>
        </el-form-item>
        <el-form-item :label="form_Money.type === '1' ? '价格' : '库存'" prop="name">
          <el-input v-model="form_Money.monynum" :placeholder="form_Money.type === '1' ? '请输入价格' : '请输入库存'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible_Money = false">取消</el-button>
        <el-button type="primary" @click="Submitchangt">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { getAllProducts, createProduct, updateProduct, deleteProduct, getCategoryList, getAdminProductDetail } from '@/api/product'
import { getAllSpecs } from '@/api/productSpec'
import { uploadSysimg } from '@/api/upload'
import { getImageUrl, compressImage } from '@/utils/request'
import {
  createSpec,
  deleteSpec
} from '@/api/productSpec'
interface Goods {
  id?: number
  category_id: number
  name: string
  subtitle: string
  main_image: string
  images1?: string
  images2?: string
  images3?: string
  images4?: string
  images5?: string
  price: string
  stock: number
  sales: number
  is_hot: number
  is_new: number
  is_recommend: number
  created_at: string
  spec_ids?: any
  sku_list: any
}

interface Category {
  id: number
  name: string
  parent_id: number
}
const form_type = ref({
  colortype: [],
  ggcm: []
})

interface TableDataItem {
  parentName: string
  childName: string
  price: number
}
const dialogVisible_Money = ref(false)
const tableData = ref<TableDataItem[]>([])
const form_Money = ref({
  type: '',
  typecg: '',
  systemdetil: '',
  monynum: ''
})
// 单元格合并方法
const spanMethod = ({ row, rowIndex, columnIndex }: any) => {
  if (columnIndex === 0) { // 第一列（一级分类）
    const parentName = row.parentName

    // 找到该parentName第一次出现的位置
    const firstIndex = tableData.value.findIndex(item => item.parentName === parentName)

    // 如果当前行是该parentName的第一次出现
    if (rowIndex === firstIndex) {
      // 计算需要合并的行数
      const count = tableData.value.filter(item => item.parentName === parentName).length
      return {
        rowspan: count,
        colspan: 1
      }
    } else {
      // 其他情况隐藏该单元格
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }

  return {
    rowspan: 1,
    colspan: 1
  }
}
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加商品')
const formRef = ref<FormInstance>()
const categoryList = ref<Category[]>([])
const specList = ref<any[]>([])
const dialogVisible_type = ref(false)
const searchForm = reactive({
  name: '',
  category_id: null,
  status: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 5,
  total: 0
})
const optionList = ref<any[]>([])

const dynamicTags = ref<any[]>([])
const dynamicTags2 = ref<any[]>([])
const tagInput2 = ref('')
const tagInput = ref('')
const handleClose = (tag: any, type: any) => {
  handleDeleteaddtabInfo(tag, type)

}
const addtabInfo = (type: any) => {
  if (type == 1) {
    // 按中英文逗号分隔，支持混合输入
    const names = tagInput.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    for (const name of names) {
      if (dynamicTags.value.some(y => y.spec_name === name)) {
        ElMessage.warning(`规格尺码"${name}"已存在，已跳过`)
        continue
      }
      handleSubmitaddtabInfo(name, 1)
    }
    tagInput.value = ''
  } else if (type == 2) {
    const names = tagInput2.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    for (const name of names) {
      if (dynamicTags2.value.some(y => y.spec_name === name)) {
        ElMessage.warning(`颜色类型"${name}"已存在，已跳过`)
        continue
      }
      handleSubmitaddtabInfo(name, 2)
    }
    tagInput2.value = ''
  }
}
const handleSubmitaddtabInfo = async (name: string, type: number) => {

  try {
    const data = {
      spec_name: name,
      sort_order: 1
    }
    let res: any
    res = await createSpec(data)
    if (res.code === 0) {
      if (type == 1) {
        dynamicTags.value.push({
          spec_name: name,
          id: res.data.id
        })
        tagInput.value = ''
      } else if (type == 2) {
        dynamicTags2.value.push({
          spec_name: name,
          id: res.data.id
        })
        tagInput2.value = ''
      }
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    console.error('提交失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  }

}
// 删除规格
const handleDeleteaddtabInfo = async (row: any, type: any) => {
  try {
    const res: any = await deleteSpec(row.id)
    if (res.code === 0) {
      if (type == 1) {
        dynamicTags.value.splice(dynamicTags.value.indexOf(row), 1)
      } else if (type == 2) {
        dynamicTags2.value.splice(dynamicTags2.value.indexOf(row), 1)
      }
      ElMessage.success('删除成功')
      // 检查当前页是否为空，如果为空且不是第一页，则跳转到上一页

    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error: any) {

  }
}
const getgoodtypelist = () => {
  optionList.value = []
  form_Money.value.systemdetil = ''
  console.log(tableData.value);
  let arr: any[] = []
  if (form_Money.value.typecg === '1') {
    for (let y of tableData.value) {
      arr.push(y.parentName)
    }
  } else if (form_Money.value.typecg === '2') {
    for (let y of tableData.value) {
      arr.push(y.childName)
    }
  }
  optionList.value = [...new Set(arr)]
  console.log(optionList.value);
}
const uploadImageFile = async (file: File): Promise<string> => {
  try {
    const res: any = await uploadSysimg(file)
    return getImageUrl(res.data.url)
  } catch (error: any) {
    console.error('图片上传失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '图片上传失败')
    throw error
  }
}
const Submitchangt = () => {
  if (form_Money.value.typecg === '1') {
    tableData.value.forEach((item) => {
      if (item.parentName === form_Money.value.systemdetil) {
        if (form_Money.value.type === '1') {
          item.price = form_Money.value.monynum
        } else if (form_Money.value.type === '2') {
          item.stock = form_Money.value.monynum
        }
      }
    })
  } else if (form_Money.value.typecg === '2') {
    tableData.value.forEach((item) => {
      if (item.childName === form_Money.value.systemdetil) {
        if (form_Money.value.type === '1') {
          item.price = form_Money.value.monynum
        } else if (form_Money.value.type === '2') {
          item.stock = form_Money.value.monynum
        }
      }
    })
  }
  dialogVisible_Money.value = false
}
const opendio = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('请先配置规格')
    return
  }
  form_Money.value.type = ''
  form_Money.value.typecg = ''
  form_Money.value.systemdetil = ''
  form_Money.value.monynum = ''
  dialogVisible_Money.value = true
}
const tabTypeimg = async (file: UploadFile, _index: number, row: any) => {
  if (!file.raw) {
    return
  }

  try {
    const compressedFile = await compressImage(file.raw as File)
    const url = await uploadImageFile(compressedFile)
    row.typeimg = url
  } catch (error) {
    // 错误信息已在 uploadImageFile 中处理
  }
}
const goodsList = ref<Goods[]>([])
// 加载分类列表
const loadCategoryList = async () => {
  try {
    const res: any = await getCategoryList()
    if (res.code === 0) {
      categoryList.value = res.data || []
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}
const handleDeleteSpec = async (row: any) => {
  try {
    console.log('删除的行数据:', row)

    // 根据 parentName 和 childName 查找并删除对应的数据
    const index = tableData.value.findIndex(
      item => item.parentName === row.parentName && item.childName === row.childName
    )

    if (index !== -1) {
      // 删除找到的数据
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')

      // 检查是否该 parentName 的所有子项都被删除了
      const remainingItems = tableData.value.filter(item => item.parentName === row.parentName)
      if (remainingItems.length === 0) {
        console.log(`${row.parentName} 的所有子项已被删除`)
      }

      console.log('删除后的表格数据:', tableData.value)
    } else {
      ElMessage.error('未找到对应的数据')
    }
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}
const SubmitType = async () => {
  let goodObj = []
  let goodObj2 = []
  for (let y of dynamicTags2.value) {
    goodObj.push({ name: y.spec_name, children: [] })
  }
  for (let k of dynamicTags.value) {
    goodObj2.push({ name: k.spec_name })
  }
  for (let g of goodObj) {
    g.children = goodObj2
  }
  console.log(goodObj);

  // 将层级数据扁平化供表格使用，保持响应式
  const flatData: any[] = []
  goodObj.forEach((parent: any) => {
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach((child: any) => {
        flatData.push({
          parentName: parent.name,
          childName: child.name,
          price: 0,
          stock: 9999,
          typeimg: ''
        })
      })
    }
  })

  // 重建对象以确保响应式
 let arrs= flatData.map(item => ({
    parentName: item.parentName,
    childName: item.childName,
    price: item.price,
    stock: item.stock,
    typeimg: item.typeimg,
  }))
   tableData.value =tableData.value.concat(arrs)
  dialogVisible_type.value = false
  console.log('扁平化后的响应式表格数据:', tableData.value)
}
// 加载规格列表
const loadSpecList = async () => {
  try {
    const res: any = await getAllSpecs()
    if (res.code === 0) {
      specList.value = res.data || []
    }
  } catch (error) {
    console.error('获取规格列表失败:', error)
  }
}

// 加载商品列表
const loadGoodsList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      pageSize: pagination.pageSize
    }

    if (searchForm.category_id) {
      params.category_id = searchForm.category_id
    }

    if (searchForm.name) {
      params.keyword = searchForm.name
    }

    if (searchForm.status !== '') {
      params.status = searchForm.status
    }

    console.log('请求商品列表参数:', params)
    const res: any = await getAllProducts(params)
    console.log('商品列表响应:', res)

    if (res.code === 0) {
      goodsList.value = res.data.list || []
      pagination.total = res.data.pagination?.total || res.data.list?.length || 0
      console.log('商品数据:', goodsList.value)
      console.log('总数:', pagination.total)
    } else {
      ElMessage.error(res.message || '获取商品列表失败')
    }
  } catch (error: any) {
    console.error('获取商品列表失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取商品列表和分类列表
onMounted(() => {
  loadCategoryList()
  loadSpecList()
  loadGoodsList()
})

const form = reactive<Goods>({
  name: '',
  category_id: null,
  subtitle: '',
  main_image: '',
  images1: '',
  images2: '',
  images3: '',
  images4: '',
  images5: '',
  price: '0.00',
  stock: 0,
  sales: 0,
  is_hot: 0,
  is_new: 0,
  is_recommend: 0,
  created_at: '',
  spec_ids: '',
  sku_list: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category_id: [
    { required: true, message: '请选择商品分类', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        if (value === 0 || value === '0' || !value) {
          callback(new Error('请选择商品分类'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const handleSearch = () => {
  pagination.current = 1
  loadGoodsList()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadGoodsList()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadGoodsList()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.category_id = null
  searchForm.status = ''
  loadGoodsList()
}

// 根据分类ID获取分类名称
const getCategoryName = (categoryId: number) => {
  const category = categoryList.value.find(cat => cat.id === categoryId)
  return category ? category.name : '未知分类'
}


const handleAdd = () => {
  dialogTitle.value = '添加商品'

  // 完全重置表单，避免使用Object.assign
  form.name = ''
  form.category_id = 0 as any // 0 表示未选择
  form.subtitle = ''
  form.main_image = ''
  form.images1 = ''
  form.images2 = ''
  form.images3 = ''
  form.images4 = ''
  form.images5 = ''
  form.price = '0.00'
  form.stock = 0
  form.sales = 0
  form.is_hot = 0
  form.is_new = 0
  form.is_recommend = 0
  form.created_at = ''
  form.spec_ids = ''
  form.id = undefined

  // 清空表格数据
  tableData.value = []

  console.log('=== 点击添加商品 ===')
  console.log('form数据:', form)
  console.log('tableData:', tableData.value)
  form_type.value = {
    colortype: [],
    ggcm: []
  }
  dialogVisible.value = true
}

const handleEdit = async (row: Goods) => {
  dialogTitle.value = '编辑商品'
  Object.assign(form, row)

  // 从后端获取商品详情（包含 goodtype 规格数据）
  try {
    const res: any = await getAdminProductDetail(row.id!)
    if (res.code === 0 && res.data) {
      Object.assign(form, res.data)
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
  }

  // 确保详情图字段有值（如果后端返回的数据没有这些字段）
  if (!form.images1) form.images1 = ''
  if (!form.images2) form.images2 = ''
  if (!form.images3) form.images3 = ''
  if (!form.images4) form.images4 = ''
  if (!form.images5) form.images5 = ''

  // 从 goodtype 表获取的规格数据（已经是数组）
  if (form.spec_ids && Array.isArray(form.spec_ids)) {
    tableData.value = form.spec_ids.map((item: any) => ({
      parentName: item.parentName || '',
      childName: item.childName || '',
      price: item.price || 0,
      stock: item.stock || 0,
      typeimg: item.typeimg || ''
    }))
  } else if (form.spec_ids && typeof form.spec_ids === 'string') {
    // 兼容旧数据（JSON字符串）
    try {
      let parsedData: any = JSON.parse(form.spec_ids)
      if (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData)
      }
      if (Array.isArray(parsedData)) {
        tableData.value = parsedData.map((item: any) => ({
          parentName: item.parentName || '',
          childName: item.childName || '',
          price: item.price || 0,
          stock: item.stock || 0,
          typeimg: item.typeimg || ''
        }))
      } else {
        tableData.value = []
      }
    } catch (e) {
      console.error('解析规格数据失败:', e)
      tableData.value = []
    }
  } else {
    tableData.value = []
  }

  dialogVisible.value = true
}

const handleDelete = async (row: Goods) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteProduct(row.id!)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        loadGoodsList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error: any) {
      console.error('删除失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  })
}

const handleImageChange = async (file: UploadFile) => {
  if (!file.raw) {
    return
  }

  try {
    const compressedFile = await compressImage(file.raw as File)
    const url = await uploadImageFile(compressedFile)
    form.main_image = url
  } catch (error) {
    // 错误信息已在 uploadImageFile 中处理
  }
}

// 处理详情图上传
const handleDetailImageChange = async (file: UploadFile, index: number) => {
  if (!file.raw) {
    return
  }

  try {
    const fieldName = `images${index + 1}` as keyof typeof form
    const compressedFile = await compressImage(file.raw as File)
    const url = await uploadImageFile(compressedFile)
      ; (form as any)[fieldName] = url
  } catch (error) {
    // 错误信息已在 uploadImageFile 中处理
  }
}

// 删除详情图
const removeDetailImage = (index: number) => {
  const fieldName = `images${index + 1}` as keyof typeof form
    ; (form as any)[fieldName] = ''
}

// 获取详情图URL的辅助函数
const getDetailImageUrl = (index: number): string => {
  const fieldName = `images${index + 1}` as keyof typeof form
  return (form as any)[fieldName] || ''
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 只提交需要的字段
        const data = {
          category_id: form.category_id,
          spec_ids: tableData.value,
          name: form.name,
          subtitle: form.subtitle,
          main_image: form.main_image,
          images1: form.images1 || '',
          images2: form.images2 || '',
          images3: form.images3 || '',
          images4: form.images4 || '',
          images5: form.images5 || '',
          price: form.price,
          stock: form.stock,
          is_hot: form.is_hot,
          is_new: form.is_new,
          is_recommend: form.is_recommend,
        }

        console.log('提交的商品数据:', tableData.value)

        let res: any

        if (form.id) {
          res = await updateProduct(form.id, data)
        } else {
          res = await createProduct(data)
        }

        if (res.code === 0) {
          ElMessage.success(form.id ? '编辑成功' : '添加成功')
          dialogVisible.value = false
          loadGoodsList()
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
</script>

<style scoped>
.goods {}

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
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.spec-level-title {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.detail-images-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.image-upload-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
  border-radius: 4px;
}

.image-label {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}
</style>
