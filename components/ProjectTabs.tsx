"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import ProjectCardComponent from "./ProjectCard"
import { useRouter } from "next/navigation"
import { useAuth } from "./AuthProvider"

interface ProjectCard {
  id: string
  title: string
  description: string
  category: "deepscope" | "blueprint" | "nextleap" | "flowops"
}

interface ProjectTabsProps {
  initialCategory?: string | null
}

const initialCards: ProjectCard[] = [
  {
    id: "producto-001",
    title: "Tarjeta de Producto",
    description: "Descripción del producto con detalles técnicos y especificaciones importantes.",
    category: "deepscope",
  },
  {
    id: "roadmap-004",
    title: "Roadmap Técnico",
    description: "Planificación técnica y cronograma de desarrollo para los próximos trimestres.",
    category: "deepscope",
  },
  {
    id: "analisis-002",
    title: "Análisis de Mercado",
    description: "Datos de investigación de mercado con insights y tendencias actuales.",
    category: "blueprint",
  },
  {
    id: "finanzas-005",
    title: "Análisis Financiero",
    description: "Proyecciones financieras y análisis de rentabilidad del proyecto.",
    category: "blueprint",
  },
  {
    id: "marketing-003",
    title: "Plan de Marketing",
    description: "Estrategia de marketing digital y canales de distribución propuestos.",
    category: "nextleap",
  },
  {
    id: "equipo-006",
    title: "Equipo y Recursos",
    description: "Estructura del equipo y recursos necesarios para la ejecución del proyecto.",
    category: "nextleap",
  },
  {
    id: "workflow-007",
    title: "Automatización de Procesos",
    description: "Flujos de trabajo automatizados para optimizar la eficiencia operativa.",
    category: "flowops",
  },
  {
    id: "monitoring-008",
    title: "Monitoreo y Alertas",
    description: "Sistema de monitoreo en tiempo real con alertas inteligentes.",
    category: "flowops",
  },
]

const categoryConfig = {
  deepscope: {
    name: "Deep Scope",
    colorScheme: {
      bg: "bg-gradient-to-br from-orange-400 to-orange-600",
      border: "border-orange-300",
      title: "text-white",
      description: "text-orange-50",
      id: "text-orange-100",
    },
    tabStyle:
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:border-orange-300",
    buttonStyle:
      "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-orange-300",
  },
  blueprint: {
    name: "Blueprint AI",
    colorScheme: {
      bg: "bg-gradient-to-br from-green-400 to-green-500",
      border: "border-green-300",
      title: "text-white",
      description: "text-green-50",
      id: "text-green-100",
    },
    tabStyle:
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:border-green-300",
    buttonStyle:
      "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white border-green-300",
  },
  nextleap: {
    name: "NextLeap",
    colorScheme: {
      bg: "bg-gradient-to-br from-purple-500 to-blue-600",
      border: "border-purple-400",
      title: "text-white",
      description: "text-purple-100",
      id: "text-purple-200",
    },
    tabStyle:
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:border-purple-400",
    buttonStyle:
      "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-purple-400",
  },
  flowops: {
    name: "FlowOps",
    colorScheme: {
      bg: "bg-gradient-to-br from-green-400 to-teal-500",
      border: "border-green-300",
      title: "text-white",
      description: "text-green-50",
      id: "text-green-100",
    },
    tabStyle:
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:border-green-300",
    buttonStyle:
      "bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white border-green-300",
  },
}

export function ProjectTabs({ initialCategory }: ProjectTabsProps = {}) {
  const [cards, setCards] = useState<ProjectCard[]>([])
  const [activeTab, setActiveTab] = useState<string>("deepscope")
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (initialCategory) {
      // Map URL category names back to internal category keys
      const categoryMap: { [key: string]: string } = {
        "deep-scope": "deepscope",
        "blueprint-ai": "blueprint",
        nextleap: "nextleap",
        flowops: "flowops",
      }

      const mappedCategory = categoryMap[initialCategory] || initialCategory
      if (mappedCategory in categoryConfig) {
        setActiveTab(mappedCategory)
      }
    }
  }, [initialCategory])

  useEffect(() => {
    const savedCards = localStorage.getItem("projectCards")
    if (savedCards) {
      try {
        const parsedCards = JSON.parse(savedCards)
        setCards(parsedCards)
      } catch (error) {
        console.error("Error parsing saved cards:", error)
        setCards(initialCards)
      }
    } else {
      setCards(initialCards)
    }
  }, [])

  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem("projectCards", JSON.stringify(cards))
    }
  }, [cards])

  const addNewCard = (category: keyof typeof categoryConfig) => {
    const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newCard: ProjectCard = {
      id: chatId,
      title: "Nueva Tarjeta",
      description: "Descripción de la nueva tarjeta. Haz clic para editar.",
      category,
    }
    setCards((prev) => [...prev, newCard])
  }

  const handleEditCard = (id: string, title: string, description: string) => {
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, title, description } : card)))
  }

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id))
  }

  const getCardsByCategory = (category: keyof typeof categoryConfig) => {
    return cards.filter((card) => card.category === category)
  }

  const navigateToCanvas = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      deepscope: "deep-scope",
      blueprint: "blueprint-ai",
      nextleap: "nextleap",
      flowops: "flowops",
    }
    router.push(`/canvas/${categoryMap[category]}`)
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-100 p-1 rounded-xl h-[60px]">
          {Object.entries(categoryConfig).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 h-full ${config.tabStyle}`}
            >
              <span className="font-medium text-base">{config.name}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  addNewCard(key as keyof typeof categoryConfig)
                }}
                className="h-6 w-6 p-0 rounded-full hover:bg-white/50 flex items-center justify-center cursor-pointer transition-colors duration-150"
              >
                <Plus className="h-4 w-4" />
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categoryConfig).map(([key, config]) => (
          <TabsContent key={key} value={key} className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between min-h-[60px]">
                <h2 className="text-2xl font-semibold">{config.name}</h2>
                <div className="flex items-center gap-3">
                  <Button onClick={() => navigateToCanvas(key)} variant="outline" className="flex items-center gap-2">
                    Abrir Lienzo
                  </Button>
                  <Button
                    onClick={() => addNewCard(key as keyof typeof categoryConfig)}
                    className={`${config.buttonStyle} flex items-center gap-2`}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Tarjeta
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCardsByCategory(key as keyof typeof categoryConfig).map((card) => (
                  <ProjectCardComponent
                    key={card.id}
                    card={card}
                    colorScheme={config.colorScheme}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteCard}
                  />
                ))}
              </div>

              {getCardsByCategory(key as keyof typeof categoryConfig).length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">No hay tarjetas en esta categoría</div>
                  <div className="flex items-center justify-center gap-3">
                    <Button onClick={() => navigateToCanvas(key)} variant="outline" className="flex items-center gap-2">
                      Abrir Lienzo
                    </Button>
                    <Button
                      onClick={() => addNewCard(key as keyof typeof categoryConfig)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Crear Primera Tarjeta
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
