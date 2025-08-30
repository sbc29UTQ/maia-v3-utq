"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/AuthProvider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isAuthenticated && !authLoading) {
      router.push("/")
    }
  }, [mounted, isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("https://stefannycobba.app.n8n.cloud/webhook/06485d43-7423-46ee-9837-4e513fecfe10", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const responseText = await response.text()

      if (response.ok) {
        let data = null
        if (responseText.trim()) {
          try {
            data = JSON.parse(responseText)
          } catch (parseError) {
            console.log("Response is not JSON, treating as success")
          }
        }

        login({ email, name: data?.name })
      } else {
        setError("Credenciales inválidas. Por favor, verifica tu email y contraseña.")
      }
    } catch (error) {
      console.error("Authentication error:", error)
      setError("Error de conexión. Por favor, intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const showLoadingState = !mounted || authLoading || (mounted && isAuthenticated)

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0c222a" }}>
      <div className="w-full max-w-md p-8 rounded-lg border-2 border-[#44D62C] bg-[#0c222a]">
        {showLoadingState ? (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#44D62C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">{!mounted || authLoading ? "Cargando..." : "Redirigiendo..."}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-white mb-2">Iniciar Sesión</h1>
              <p className="text-gray-300 text-sm">Ingresa tus credenciales para acceder</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-red-900/20 border border-red-500/50 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#44D62C] text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1a3a42] border-gray-600 text-white placeholder:text-gray-400 focus:border-[#44D62C] focus:ring-[#44D62C]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#44D62C] text-sm font-medium">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1a3a42] border-gray-600 text-white placeholder:text-gray-400 focus:border-[#44D62C] focus:ring-[#44D62C]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#44D62C] hover:bg-[#3bc428] text-black font-medium py-3 rounded-md transition-colors"
              >
                {isLoading ? "Iniciando..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center text-sm text-gray-400">
              <div className="w-2 h-2 bg-[#44D62C] rounded-full mr-2"></div>
              Sistema de autenticación activo
            </div>
          </>
        )}
      </div>
    </div>
  )
}
