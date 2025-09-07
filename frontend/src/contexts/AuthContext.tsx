"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authAPI } from "../services/api"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("admin_token")
      if (storedToken) {
        try {
          const isValid = await authAPI.verifyToken(storedToken)
          if (isValid) {
            setToken(storedToken)
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem("admin_token")
          }
        } catch (error) {
          console.error("Token verification failed:", error)
          localStorage.removeItem("admin_token")
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(password)
      if (response.success && response.token) {
        setToken(response.token)
        setIsAuthenticated(true)
        localStorage.setItem("admin_token", response.token)
        return true
      }
      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout(token)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setToken(null)
      setIsAuthenticated(false)
      localStorage.removeItem("admin_token")
    }
  }

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
