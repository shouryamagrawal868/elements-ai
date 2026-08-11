import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
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