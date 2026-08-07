'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'buyer' | 'supplier' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  company?: string
  role: UserRole
  verified: boolean
  avatar?: string
  phone?: string
  country?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  company?: string
  role: UserRole
  phone?: string
  country?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Session is now managed via HttpOnly cookie
    // Just verify with backend on page load
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.customer) {
            setUser({
              ...data.customer,
              role: 'buyer',
              verified: true,
            })
          }
        }
      } catch (e) {
        // Not authenticated - that's fine
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' }
      }

      setUser({
        ...data.customer,
        role: 'buyer',
        verified: true,
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          company: data.company,
          phone: data.phone,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Registration failed' }
      }

      setUser({
        ...result.customer,
        role: data.role,
        verified: false,
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      // Call API to clear the HttpOnly cookie
      await fetch('/api/auth/me', {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null)
  }

  const updateProfile = (data: Partial<User>) => {
    if (!user) return
    setUser({ ...user, ...data })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
