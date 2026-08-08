import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
})

export const recognizeMusic = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/recognition/identify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const getDatasetStats = async () => {
  const response = await api.get('/dataset/stats')
  return response.data
}

export default api