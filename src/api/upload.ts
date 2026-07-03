import request from '@/utils/request'

export const uploadSysimg = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/upload/sysimg', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
