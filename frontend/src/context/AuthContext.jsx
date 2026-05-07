import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('soulsync_token')
    const profileId = localStorage.getItem('soulsync_profile_id')
    const userId = localStorage.getItem('soulsync_user_id')
    return token ? { token, profileId: profileId ? Number(profileId) : null, userId: userId ? Number(userId) : null } : null
  })

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('soulsync_token', data.token)
    localStorage.setItem('soulsync_user_id', String(data.userId))
    if (data.profileId) localStorage.setItem('soulsync_profile_id', String(data.profileId))
    setAuth({ token: data.token, userId: data.userId, profileId: data.profileId ?? null })
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('soulsync_token')
    localStorage.removeItem('soulsync_user_id')
    localStorage.removeItem('soulsync_profile_id')
    setAuth(null)
  }, [])

  const setProfileId = useCallback((profileId) => {
    localStorage.setItem('soulsync_profile_id', String(profileId))
    setAuth((prev) => prev ? { ...prev, profileId } : prev)
  }, [])

  return (
    <AuthContext.Provider value={{ auth, login, logout, setProfileId, isLoggedIn: !!auth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
