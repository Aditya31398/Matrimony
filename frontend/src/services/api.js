import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('soulsync_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    const profileId = localStorage.getItem('soulsync_profile_id')
    if (profileId) config.headers['X-Profile-Id'] = profileId
    config.headers['X-Tenant-ID'] = window.__TENANT_ID__ ?? 'soulsync'
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default api
