"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

interface Card {
  id: string
  title: string
  description: string
  idLabel: string
}

interface Category {
  id: string
  name: string
  cards: Card[]
}

const initialCategories: Category[] = [
  {
    id: "deep-scope",
    name: "Deep Scope",
    cards: [
      {
        id: "producto-001",
        title: "Tarjeta de Producto",
        description: "Descripción del producto con detalles técnicos y especificaciones importantes.",
        idLabel: "ID: producto-001",
      },
      {
        id: "roadmap-004",
        title: "Roadmap Técnico",
        description: "Planificación técnica y cronograma de desarrollo para los próximos trimestres.",
        idLabel: "ID: roadmap-004",
      },
    ],
  },
  {
    id: "blueprint",
    name: "Blueprint AI",
    cards: [
      {
        id: "analisis-002",
        title: "Análisis de Mercado",
        description: "Datos de investigación de mercado con insights y tendencias actuales.",
        idLabel: "ID: analisis-002",
      },
      {
        id: "finanzas-005",
        title: "Análisis Financiero",
        description: "Proyecciones financieras y análisis de rentabilidad del proyecto.",
        idLabel: "ID: finanzas-005",
      },
    ],
  },
  {
    id: "flow-ops",
    name: "Flow Ops",
    cards: [
      {
        id: "operaciones-007",
        title: "Procesos Operativos",
        description: "Flujos de trabajo y procesos operativos optimizados para la eficiencia.",
        idLabel: "ID: operaciones-007",
      },
      {
        id: "automatizacion-008",
        title: "Automatización",
        description: "Sistemas de automatización y herramientas para optimizar procesos.",
        idLabel: "ID: automatizacion-008",
      },
    ],
  },
  {
    id: "next-leap",
    name: "Next Leap",
    cards: [
      {
        id: "marketing-003",
        title: "Plan de Marketing",
        description: "Estrategia de marketing digital y canales de distribución propuestos.",
        idLabel: "ID: marketing-003",
      },
      {
        id: "equipo-006",
        title: "Equipo y Recursos",
        description: "Estructura del equipo y recursos necesarios para la ejecución del proyecto.",
        idLabel: "ID: equipo-006",
      },
    ],
  },
]

export function CategoryInterface() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const addCard = (categoryId: string) => {
    const newCard: Card = {
      id: `new-${Date.now()}`,
      title: "Nueva Tarjeta",
      description: "Descripción de la nueva tarjeta creada dinámicamente.",
      idLabel: `ID: new-${Date.now()}`,
    }

    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, cards: [...category.cards, newCard] } : category,
      ),
    )

    // Expand the category if it's not already expanded
    if (!expandedCategories.has(categoryId)) {
      setExpandedCategories((prev) => new Set([...prev, categoryId]))
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Cove-like Interface</h1>
        <p className="text-slate-600">
          Esta es una demostración del widget de chat flotante. El chat puede referenciar tarjetas usando @menciones.
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {categories.map((category) => (
          <div key={category.id} className="space-y-4">
            {/* Category Header */}
            <div className="bg-white border-2 border-slate-300 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="font-semibold text-slate-900">{category.name}</span>
              <button
                onClick={() => {
                  toggleCategory(category.id)
                  addCard(category.id)
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 transition-colors rounded"
              >
                <Plus className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Cards */}
            {expandedCategories.has(category.id) && (
              <div className="space-y-3">
                {category.cards.map((card) => (
                  <div key={card.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-2">{card.title}</h3>
                    <p className="text-slate-600 text-sm mb-3">{card.description}</p>
                    <p className="text-slate-400 text-xs">{card.idLabel}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-slate-100 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Cómo usar el chat</h2>
        <ul className="space-y-2 text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Haz clic en el ícono de chat en la esquina inferior derecha para abrir el widget</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Usa @ seguido del nombre de una tarjeta para referenciarla</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Prueba las sugerencias rápidas para interacciones comunes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>El chat es completamente responsive y se adapta a dispositivos móviles</span>
          </li>
        </ul>
      </div>

      {/* KM-IA Button */}
      <div className="fixed bottom-20 right-6">
        <button className="bg-white border-2 border-slate-300 rounded-lg px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
          KM- IA
        </button>
      </div>
    </div>
  )
}
