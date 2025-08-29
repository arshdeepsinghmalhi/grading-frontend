import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import { log } from 'node:console'

interface User {
  id: string
  email: string
  full_name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ useCallback so the function is stable across renders
  const checkAuthStatus = useCallback(async () => {
    console.log("Checking authStatus");
    if(!user && window.location.pathname == '/auth'){
      return;
    }
    try {
      const userData = await apiFetch('/api/auth/me', { 
        method: 'GET',
        credentials: 'include'
      })
      console.log("Checking auth userData:", userData);
      setUser(userData.user)
      console.log('Set User Data');
    } catch {
      console.log("Auth Failed");
      setUser(null);
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ runs once on mount (or twice in dev StrictMode, harmless)
  useEffect(() => {
    console.log("Checking auth useEffect...");
    checkAuthStatus();
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      await apiFetch('/api/auth/signup', {
        method: 'POST',
        jsonBody: { email, password, fullName },
        credentials: 'include'
      })
      return await signIn(email, password) // auto sign-in
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiFetch('/api/auth/signin', {
        method: 'POST',
        jsonBody: { email, password },
        credentials: 'include'
      })
      
      setUser(response.user)
      console.log("Signed in user:", response.user);
      checkAuthStatus();
      window.location.href = '/'
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const signOut = async () => {
    try {
      await apiFetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setUser(null)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        jsonBody: { email },
        credentials: 'include'
      })
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const value = { user, loading, signUp, signIn, signOut, resetPassword }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
