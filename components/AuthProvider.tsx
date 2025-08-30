"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  user: { email: string; name: string } | null
  login: (userData?: { email: string; name?: string }) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true"
    const userData = localStorage.getItem("userData")

    setIsAuthenticated(authStatus)
    if (userData) {
      setUser(JSON.parse(userData))
    }

    if (authStatus) {
      document.cookie = "isAuthenticated=true; path=/; max-age=86400; SameSite=strict"
    }

    setIsLoading(false)
  }, [])

  const login = (userData?: { email: string; name?: string }) => {
    localStorage.setItem("isAuthenticated", "true")
    document.cookie = "isAuthenticated=true; path=/; max-age=86400; SameSite=strict"

    if (userData) {
      const userInfo = {
        email: userData.email,
        name: userData.name || userData.email.split("@")[0],
      }
      localStorage.setItem("userData", JSON.stringify(userInfo))
      setUser(userInfo)
    }

    setIsAuthenticated(true)
    router.push("/")
  }

  const logout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userData")
    document.cookie = "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setIsAuthenticated(false)
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
