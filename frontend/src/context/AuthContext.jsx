import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import queryClient from '../utils/queryClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('soulsync_token')
    const profileId = localStorage.getItem('soulsync_profile_id')
    const userId = localStorage.getItem('soulsync_user_id')
    return token ? { token, profileId: profileId ? Number(profileId) : null, userId: userId ? Number(userId) : null } : null
  })

  // Another tab logged in or out: every tab shares localStorage, so follow it here too
  // instead of showing one account's data while sending the other account's token.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== 'soulsync_token' && e.key !== null) return
      queryClient.clear()
      const token = localStorage.getItem('soulsync_token')
      if (!token) {
        setAuth(null)
        return
      }
      const profileId = localStorage.getItem('soulsync_profile_id')
      const userId = localStorage.getItem('soulsync_user_id')
      setAuth({ token, profileId: profileId ? Number(profileId) : null, userId: userId ? Number(userId) : null })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email: email.trim(), password })
    // Drop anything cached for a previous account (profile, chats, premium status…)
    queryClient.clear()
    localStorage.setItem('soulsync_user_id', String(data.userId))
    if (data.profileId) localStorage.setItem('soulsync_profile_id', String(data.profileId))
    else localStorage.removeItem('soulsync_profile_id')
    // Token last: other tabs react to it and must already see the new ids
    localStorage.setItem('soulsync_token', data.token)
    setAuth({ token: data.token, userId: data.userId, profileId: data.profileId ?? null })
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('soulsync_token')
    localStorage.removeItem('soulsync_user_id')
    localStorage.removeItem('soulsync_profile_id')
    queryClient.clear()
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
