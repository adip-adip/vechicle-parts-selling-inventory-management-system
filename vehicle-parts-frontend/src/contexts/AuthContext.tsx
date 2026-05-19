import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { LoginDto, LoginResponse } from '../types/api'
import { authApi } from '../api/auth'

interface User {
  userId: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (data: LoginDto) => Promise<LoginResponse>
  logout: () => void
  isAuthenticated: boolean
  hasRole: (...roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function getStoredUser(): User | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

function getStoredToken(): string | null {
  return localStorage.getItem('token')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [token, setToken] = useState<string | null>(getStoredToken)

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')

    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [token, user])

  const login = async (data: LoginDto) => {
    const res = await authApi.login(data)
    if (!res.success || !res.token || !res.role) {
      throw new Error(res.message || 'Login failed')
    }
    setToken(res.token)
    setUser({
      userId: res.userId!,
      email: res.email!,
      firstName: res.firstName!,
      lastName: res.lastName!,
      role: res.role!,
    })
    return res
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const hasRole = (...roles: string[]) => {
    if (!user) return false
    return roles.some(r => r.toLowerCase() === user.role.toLowerCase())
  }

  return (
    <AuthContext.Provider value={{
      user, token, login, logout,
      isAuthenticated: !!token && !!user,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
