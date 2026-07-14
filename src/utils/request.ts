import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const IMAGE_BASE_URL = window.location.origin

// 图片压缩：将图片压缩到指定最大宽度/高度，并降低质量
export const compressImage = (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.7
): Promise<File> => {
  return new Promise((resolve) => {
    // 小于200KB的图片不压缩，直接返回
    if (file.size < 200 * 1024) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img

        // 按比例缩放
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              console.log(
                `图片压缩: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`
              )
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

// 将相对路径图片URL拼接完整地址
export const getImageUrl = (url: string): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return IMAGE_BASE_URL + (url.startsWith('/') ? url : '/' + url)
}

// 创建axios实例
const request = axios.create({
  baseURL: 'https://guodongyichu.fun/api',
  timeout: 60000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data

    // 如果返回的状态码不是200，说明接口有问题
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')

      // 401: 未登录
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.logout()
        window.location.href = '/login'
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  error => {
    console.error('请求错误:', error.status)
     if ( error.status == 401) {
        const userStore = useUserStore()
        userStore.logout()
        window.location.href = '/login'
      }
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
