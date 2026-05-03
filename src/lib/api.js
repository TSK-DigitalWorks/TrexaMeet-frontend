import axios from 'axios'
import { getSession, clearSession } from './auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const session = getSession()
  const token = session?.accessToken || session?.accesstoken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      clearSession()
    }
    return Promise.reject(error)
  }
)

export default api
