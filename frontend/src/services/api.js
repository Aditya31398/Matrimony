import axios from 'axios'

// VITE_API_BASE_URL should be the backend origin (no trailing slash, no /api).
// Local dev:  set to http://localhost:8080 in .env  (proxy not needed)
// Production: set to https://your-app.onrender.com in Vercel env vars
const baseURL = `${(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')}/api`

const api = axios.create({
  baseURL,
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
    config.headers['X-Tenant-ID'] = window.__TENANT_ID__ ?? 'soulsync'
    const profileId = localStorage.getItem('soulsync_profile_id')
    if (profileId) config.headers['X-Profile-Id'] = profileId

    // For FormData (file uploads) let axios/browser set Content-Type with
    // the correct multipart boundary — never force application/json.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const data = error.response?.data

    // Expired/invalid session: Spring answers 401, or 403 with an empty body
    // (a real "access denied" carries a message). Sign out instead of showing broken pages.
    if (localStorage.getItem('soulsync_token') && (status === 401 || (status === 403 && !data))) {
      localStorage.removeItem('soulsync_token')
      localStorage.removeItem('soulsync_user_id')
      localStorage.removeItem('soulsync_profile_id')
      window.location.assign('/login?expired=1')
    }

    const message =
      data?.message ||
      data?.error ||
      error.message ||
      'An unexpected error occurred'
    const err = new Error(message)
    err.status = status
    err.code = data?.code   // e.g. PREMIUM_REQUIRED
    return Promise.reject(err)
  }
)

export default api
