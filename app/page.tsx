"use client"

import { ChatWidget } from "@/components/ChatWidget"
import { ProjectTabs } from "@/components/ProjectTabs"
import Image from "next/image"
import { useAuth } from "@/components/AuthProvider"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function Home() {
  const { logout, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#44D62C] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="mb-2">
                <Image src="/maia-logo.png" alt="MaiA" width={200} height={100} className="h-12 w-auto" priority />
              </div>
              <p className="text-gray-600">
                Esta es una demostración del widget de chat flotante. El chat puede referenciar tarjetas usando
                @menciones.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
              <div className="flex-shrink-0">
                <Image
                  src="/utopiq-logo.png"
                  alt="UTOPIQ Tech Digital Lab"
                  width={170}
                  height={51}
                  className="h-10 w-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </header>

        {/* Project Tabs Container */}
        <div className="mb-8">
          <ProjectTabs initialCategory={categoryParam} />
        </div>

        {/* Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="font-semibold text-green-900 mb-2">Cómo usar la interfaz</h2>
          <div className="text-green-800 text-sm space-y-2">
            <p>
              • <strong>Pestañas:</strong> Navega entre las diferentes categorías de proyectos (Deep Scope, Blueprint
              AI, NextLeap, FlowOps)
            </p>
            <p>
              • <strong>Agregar tarjetas:</strong> Usa el botón "+" en cada pestaña o el botón "Agregar Tarjeta" para
              crear nuevas tarjetas
            </p>
            <p>
              • <strong>Chat:</strong> Haz clic en el ícono de chat en la esquina inferior derecha para abrir el widget
            </p>
            <p>
              • <strong>Referencias:</strong> Usa <code className="bg-green-100 px-1 rounded">@</code> seguido del
              nombre de una tarjeta para referenciarla en el chat
            </p>
            <p>
              • <strong>Colores:</strong> Cada categoría tiene su propio esquema de colores para facilitar la
              organización
            </p>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  )
}
