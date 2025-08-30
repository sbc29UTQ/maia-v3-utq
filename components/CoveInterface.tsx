"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, ZoomIn, ZoomOut, Target, Home, ArrowLeft, Send, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import ChartPerformanceMonitor from "./charts/ChartPerformanceMonitor"
import { generateQuickChartUrl, createChartConfig } from "@/lib/quickchart-utils"

interface CanvasCard {
  id: string
  title: string
  content: string
  x: number
  y: number
  width: number
  height: number
  type: "strategy" | "analysis" | "plan" | "metrics"
  tags: string[]
  cardInput: string
  chatId: string
  userName: string
  richContent?: {
    tables?: Array<{
      headers: string[]
      rows: string[][]
    }>
    images?: Array<{
      src: string
      alt: string
      caption?: string
    }>
    charts?: Array<{
      id?: string
      type: "bar" | "pie" | "line" | "area" | "scatter"
      library?: "recharts" | "chartjs" | "d3" | "apex"
      data: Array<{ label: string; value: number; color?: string; x?: number; y?: number }>
      title?: string
      config?: Record<string, any>
      interactive?: boolean
      optimized?: boolean
    }>
  }
}

interface CoveInterfaceProps {
  chatId: string
  userName: string
  category: string
  externalCanvasCards?: CanvasCard[]
}

const generateAIImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Professional business illustration: ${prompt}. Modern, clean design with corporate colors.`,
        size: "1024x1024",
        quality: "standard",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate image")
    }

    const { imageUrl } = await response.json()
    return imageUrl
  } catch (error) {
    console.error("[v0] Error generating AI image:", error)
    return null
  }
}

const parseHTMLTables = (
  htmlContent: string,
): Array<{ headers: string[]; rows: string[][]; originalHTML?: string }> => {
  const tables: Array<{ headers: string[]; rows: string[][]; originalHTML?: string }> = []

  // Extract table elements using regex
  const tableMatches = htmlContent.match(/<table[^>]*>[\s\S]*?<\/table>/gi)

  if (tableMatches) {
    tableMatches.forEach((tableHTML) => {
      // Check if table already has Tailwind classes - if so, preserve original HTML
      const hasTailwindClasses = /class="[^"]*(?:min-w-full|divide-y|bg-white|shadow|ring-|rounded-lg)/i.test(tableHTML)

      if (hasTailwindClasses) {
        // For well-styled HTML tables, preserve the original HTML structure
        tables.push({
          headers: [],
          rows: [],
          originalHTML: tableHTML,
        })
        return
      }

      // Extract headers for basic HTML tables
      const headerMatch = tableHTML.match(/<thead[^>]*>[\s\S]*?<\/thead>/i)
      let headers: string[] = []

      if (headerMatch) {
        const thMatches = headerMatch[0].match(/<th[^>]*>([\s\S]*?)<\/th>/gi)
        if (thMatches) {
          headers = thMatches.map((th) => th.replace(/<[^>]*>/g, "").trim())
        }
      } else {
        // Try to get headers from first row if no thead
        const firstRowMatch = tableHTML.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i)
        if (firstRowMatch) {
          const cellMatches = firstRowMatch[1].match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)
          if (cellMatches) {
            headers = cellMatches.map((cell) => cell.replace(/<[^>]*>/g, "").trim())
          }
        }
      }

      // Extract rows for basic HTML tables
      const rows: string[][] = []
      const tbodyMatch = tableHTML.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i)
      const rowsHTML = tbodyMatch ? tbodyMatch[1] : tableHTML

      const rowMatches = rowsHTML.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi)
      if (rowMatches) {
        rowMatches.forEach((rowHTML) => {
          const cellMatches = rowHTML.match(/<td[^>]*>([\s\S]*?)<\/td>/gi)
          if (cellMatches) {
            const rowData = cellMatches.map((cell) => cell.replace(/<[^>]*>/g, "").trim())
            if (rowData.length > 0) {
              rows.push(rowData)
            }
          }
        })
      }

      if (headers.length > 0 || rows.length > 0) {
        tables.push({ headers, rows })
      }
    })
  }

  return tables
}

const HTMLContentFormatter: React.FC<{ content: string }> = ({ content }) => {
  // Check if content contains HTML tags
  const hasHTML = /<[^>]*>/g.test(content)

  if (!hasHTML) {
    return <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{content}</div>
  }

  const htmlTables = parseHTMLTables(content)

  // Remove table HTML from content to avoid duplication
  const cleanContent = content.replace(/<table[^>]*>[\s\S]*?<\/table>/gi, "")

  // Format remaining HTML content with Tailwind classes
  const formatHTMLContent = (htmlString: string) => {
    return (
      htmlString
        // Headers
        .replace(
          /<h1[^>]*>(.*?)<\/h1>/gi,
          '<h1 class="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">$1</h1>',
        )
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '<h2 class="text-lg font-semibold text-gray-800 mb-3 mt-4">$1</h2>')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '<h3 class="text-base font-medium text-gray-700 mb-2 mt-3">$1</h3>')

        // Paragraphs
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '<p class="text-sm text-gray-600 mb-3 leading-relaxed">$1</p>')

        // Lists
        .replace(/<ul[^>]*>/gi, '<ul class="list-disc list-inside space-y-1 mb-3 ml-4">')
        .replace(/<ol[^>]*>/gi, '<ol class="list-decimal list-inside space-y-1 mb-3 ml-4">')
        .replace(/<li[^>]*>(.*?)<\/li>/gi, '<li class="text-sm text-gray-600">$1</li>')

        // Links
        .replace(
          /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,
          '<a href="$1" class="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">$2</a>',
        )

        // Strong/Bold
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '<strong class="font-semibold text-gray-800">$1</strong>')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '<b class="font-semibold text-gray-800">$1</b>')

        // Emphasis/Italic
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '<em class="italic text-gray-700">$1</em>')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '<i class="italic text-gray-700">$1</i>')

        // Code blocks
        .replace(
          /<pre[^>]*>(.*?)<\/pre>/gi,
          '<pre class="bg-gray-100 border border-gray-200 rounded-lg p-3 text-xs font-mono overflow-x-auto mb-3">$1</pre>',
        )
        .replace(
          /<code[^>]*>(.*?)<\/code>/gi,
          '<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>',
        )

        // Blockquotes
        .replace(
          /<blockquote[^>]*>(.*?)<\/blockquote>/gi,
          '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 text-gray-700 italic mb-3">$1</blockquote>',
        )

        // Dividers
        .replace(/<hr[^>]*>/gi, '<hr class="border-t border-gray-200 my-4">')

        // Spans with basic styling
        .replace(/<span[^>]*>(.*?)<\/span>/gi, '<span class="text-gray-600">$1</span>')

        // Divs
        .replace(/<div[^>]*>(.*?)<\/div>/gi, '<div class="mb-2">$1</div>')
    )
  }

  return (
    <div className="space-y-4">
      {htmlTables.map((table, index) => (
        <div key={`html-table-${index}`}>
          {table.originalHTML ? (
            <div className="html-table-container" dangerouslySetInnerHTML={{ __html: table.originalHTML }} />
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600">
                <h4 className="text-sm font-semibold text-white">Tabla HTML</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  {table.headers.length > 0 && (
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-green-50">
                        {table.headers.map((header, i) => (
                          <th
                            key={i}
                            className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-gray-200"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-gray-100">
                    {table.rows.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200"
                      >
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Render remaining HTML content */}
      {cleanContent.trim() && (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: formatHTMLContent(cleanContent),
          }}
        />
      )}
    </div>
  )
}

const RichContentRenderer: React.FC<{ richContent?: CanvasCard["richContent"] }> = ({ richContent }) => {
  if (!richContent) return null

  return (
    <div className="space-y-6 mt-4">
      {/* Enhanced Tables with better Tailwind styling */}
      {richContent.tables?.map((table, index) => (
        <div
          key={`table-${index}`}
          className="overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-gradient-to-br from-white to-gray-50"
        >
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h4 className="text-sm font-semibold text-white">Tabla de Datos</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              {table.headers && table.headers.length > 0 && (
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                    {table.headers.map((header, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-gray-200 first:rounded-tl-lg last:rounded-tr-lg"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-gray-100">
                {table.rows &&
                  table.rows.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                    >
                      {row &&
                        row.map((cell, j) => (
                          <td key={j} className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                            {cell}
                          </td>
                        ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Enhanced Images with AI Generation and loading states */}
      {richContent.images?.map((image, index) => (
        <div
          key={`image-${index}`}
          className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg overflow-hidden"
        >
          <div className="relative group">
            <img
              src={image.src || "/placeholder.svg?height=300&width=400&query=business visualization"}
              alt={image.alt}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/error-loading-abstract.png"
              }}
            />
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium shadow-lg">
                ✨ AI Generated
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {image.caption && (
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
              <p className="text-xs text-gray-600 italic font-medium">{image.caption}</p>
            </div>
          )}
        </div>
      ))}

      {/* Enhanced Charts with QuickChart and better styling */}
      {richContent.charts?.map((chart, index) => {
        const chartConfig = createChartConfig(chart.type === "area" ? "line" : chart.type, chart.data, chart.title)
        const chartUrl = generateQuickChartUrl(chartConfig, 450, 280)

        return (
          <div
            key={`chart-${index}`}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg p-6"
          >
            {chart.title && (
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-800">{chart.title}</h4>
                <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-full font-medium">
                  📊 QuickChart
                </span>
              </div>
            )}

            <div className="relative group">
              <img
                src={chartUrl || "/placeholder.svg?height=280&width=450&query=chart visualization"}
                alt={`${chart.type} chart: ${chart.title || "Chart"}`}
                className="w-full h-auto rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/chart-error.png"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {chart.data &&
                chart.data.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 shadow-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: item.color || "#3B82F6" }}
                    />
                    <span className="text-xs text-gray-700 font-medium">
                      {item.label}: <span className="font-semibold text-gray-900">{item.value}</span>
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const CoveInterface: React.FC<CoveInterfaceProps> = ({ chatId, userName, category, externalCanvasCards = [] }) => {
  const router = useRouter()
  const [chatMessage, setChatMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTool, setSelectedTool] = useState("Text")
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizingCard, setResizingCard] = useState<string | null>(null)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState<string | null>(null)

  const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
  const [zoomLevel, setZoomLevel] = useState(1)
  const [zoomIndex, setZoomIndex] = useState(3) // Index for 100%
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [isTransitioning, setIsTransitioning] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const [interactingCard, setInteractingCard] = useState<string | null>(null)

  const [canvasCards, setCanvasCards] = useState<CanvasCard[]>([
    {
      id: "impact-effort-matrix-card",
      title: "Matriz de Impacto vs Esfuerzo",
      content: `Herramienta estratégica para priorizar iniciativas basada en su impacto potencial y el esfuerzo requerido para implementarlas.`,
      x: 50,
      y: 50,
      width: 400,
      height: 450,
      type: "strategy",
      tags: ["Priorización", "Estrategia", "Planificación", "Decisiones"],
      cardInput: "",
      chatId: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userName: userName,
      richContent: {
        images: [
          {
            src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20%285%29-LpSIlBHvhrePxgT92B16NOWzC5dIKG.png",
            alt: "Matriz de Impacto vs Esfuerzo",
          },
        ],
      },
    },
    {
      id: "empathy-map-card",
      title: "Mapa de Empatía",
      content: `Template para comprender mejor a los usuarios mediante el análisis de lo que piensan, sienten, ven, oyen, dicen y hacen.`,
      x: 500,
      y: 100,
      width: 400,
      height: 450,
      type: "analysis",
      tags: ["UX", "Investigación", "Usuario", "Empatía"],
      cardInput: "",
      chatId: `chat-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`,
      userName: userName,
      richContent: {
        images: [
          {
            src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20%284%29-qZKV2ldsMNwOBqZLhrccXX8amGbRby.png",
            alt: "Mapa de Empatía",
          },
        ],
      },
    },
    {
      id: "bcg-matrix-card",
      title: "Matriz BCG",
      content: `Herramienta de análisis de portafolio que clasifica productos según su participación de mercado y crecimiento.`,
      x: 100,
      y: 550,
      width: 400,
      height: 450,
      type: "metrics",
      tags: ["Análisis", "Portafolio", "Estrategia", "BCG"],
      cardInput: "",
      chatId: `chat-${Date.now() + 2}-${Math.random().toString(36).substr(2, 9)}`,
      userName: userName,
      richContent: {
        images: [
          {
            src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20%286%29-qI50c2PSkP8rBhhVYckKNzs51hVPgz.png",
            alt: "Matriz BCG",
          },
        ],
      },
    },
  ])
  const [cardCounter, setCardCounter] = useState(4)
  const [cardInputs, setCardInputs] = useState<{ [cardId: string]: string }>({})

  const tools = [
    { name: "Text", icon: Plus },
    { name: "File upload", icon: Plus },
    { name: "URL", icon: Plus },
    { name: "AI App", icon: Plus },
    { name: "AI Image", icon: Minus },
  ]

  useEffect(() => {
    if (externalCanvasCards.length > 0) {
      setCanvasCards((prev) => {
        const existingIds = prev.map((card) => card.id)
        const newCards = externalCanvasCards.filter((card) => !existingIds.includes(card.id))
        return [...prev, ...newCards]
      })
    }
  }, [externalCanvasCards])

  useEffect(() => {
    const updateViewport = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setViewport({ width: rect.width, height: rect.height })
      }
    }

    updateViewport()
    window.addEventListener("resize", updateViewport)
    return () => window.removeEventListener("resize", updateViewport)
  }, [])

  const virtualToScreen = (virtualCoord: { x: number; y: number }) => ({
    x: virtualCoord.x * zoomLevel + panOffset.x,
    y: virtualCoord.y * zoomLevel + panOffset.y,
  })

  const screenToVirtual = (screenCoord: { x: number; y: number }) => ({
    x: (screenCoord.x - panOffset.x) / zoomLevel,
    y: (screenCoord.y - panOffset.y) / zoomLevel,
  })

  const isElementVisible = (card: CanvasCard) => {
    const screenPos = virtualToScreen({ x: card.x, y: card.y })
    const cardRight = screenPos.x + card.width * zoomLevel
    const cardBottom = screenPos.y + card.height * zoomLevel

    return !(cardRight < 0 || cardBottom < 0 || screenPos.x > viewport.width || screenPos.y > viewport.height)
  }

  const handleZoomIn = () => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) {
      setIsTransitioning(true)
      setZoomIndex((prev) => prev + 1)
      setZoomLevel(ZOOM_LEVELS[zoomIndex + 1])
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const handleZoomOut = () => {
    if (zoomIndex > 0) {
      setIsTransitioning(true)
      setZoomIndex((prev) => prev - 1)
      setZoomLevel(ZOOM_LEVELS[zoomIndex - 1])
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const handleCenterView = () => {
    setIsTransitioning(true)
    setZoomLevel(1)
    setZoomIndex(3)
    setPanOffset({ x: 0, y: 0 })
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl/Cmd + wheel
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const delta = e.deltaY > 0 ? -1 : 1
      const newIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, zoomIndex + delta))

      if (newIndex !== zoomIndex) {
        const newZoom = ZOOM_LEVELS[newIndex]
        const zoomRatio = newZoom / zoomLevel

        // Zoom towards mouse position
        const newPanX = mouseX - (mouseX - panOffset.x) * zoomRatio
        const newPanY = mouseY - (mouseY - panOffset.y) * zoomRatio

        setIsTransitioning(true)
        setZoomLevel(newZoom)
        setZoomIndex(newIndex)
        setPanOffset({ x: newPanX, y: newPanY })
        setTimeout(() => setIsTransitioning(false), 200)
      }
    } else {
      // Pan with wheel
      setPanOffset((prev) => ({
        x: prev.x - e.deltaX * 0.5,
        y: prev.y - e.deltaY * 0.5,
      }))
    }
  }

  const handleMouseDown = (e: React.MouseEvent, cardId: string) => {
    // Prevent dragging when clicking on text inputs or buttons
    const target = e.target as HTMLElement
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "BUTTON" ||
      target.closest("button")
    ) {
      return
    }

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }

    if (resizingCard) return

    const card = canvasCards.find((c) => c.id === cardId)
    if (!card || !canvasRef.current) return

    setSelectedCard(cardId)

    const cardElement = e.currentTarget as HTMLElement
    const cardRect = cardElement.getBoundingClientRect()

    setDraggedCard(cardId)
    setDragOffset({
      x: (e.clientX - cardRect.left) / zoomLevel,
      y: (e.clientY - cardRect.top) / zoomLevel,
    })
    setIsDragging(cardId)

    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && !draggedCard && !resizingCard) {
      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y
      setPanOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }))
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }

    if (resizingCard && resizeHandle && canvasRef.current) {
      const deltaX = (e.clientX - resizeStart.x) / zoomLevel
      const deltaY = (e.clientY - resizeStart.y) / zoomLevel

      setCanvasCards((prev) =>
        prev.map((card) => {
          if (card.id !== resizingCard) return card

          let newWidth = card.width
          let newHeight = card.height
          let newX = card.x
          let newY = card.y

          if (resizeHandle.includes("right")) {
            newWidth = Math.max(250, resizeStart.width + deltaX)
          }
          if (resizeHandle.includes("left")) {
            newWidth = Math.max(250, resizeStart.width - deltaX)
            newX = card.x + (card.width - newWidth)
          }
          if (resizeHandle.includes("bottom")) {
            newHeight = Math.max(200, resizeStart.height + deltaY)
          }
          if (resizeHandle.includes("top")) {
            newHeight = Math.max(200, resizeStart.height - deltaY)
            newY = card.y + (card.height - newHeight)
          }

          return {
            ...card,
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY,
          }
        }),
      )
    } else if (draggedCard && !resizingCard && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const newX = (e.clientX - rect.left - panOffset.x) / zoomLevel - dragOffset.x
      const newY = (e.clientY - rect.top - panOffset.y) / zoomLevel - dragOffset.y

      setCanvasCards((prev) =>
        prev.map((card) =>
          card.id === draggedCard
            ? {
                ...card,
                x: Math.max(-100, Math.min(newX, rect.width / zoomLevel - card.width + 100)), // Allow slight overflow
                y: Math.max(-100, Math.min(newY, rect.height / zoomLevel - card.height + 100)), // Allow slight overflow
              }
            : card,
        ),
      )
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setDraggedCard(null)
    setDragOffset({ x: 0, y: 0 })
    setResizingCard(null)
    setResizeHandle(null)
    setIsDragging(null)
  }

  const canvasSize = { width: 2000, height: 1500 }

  const generateCardWithRichContent = async (message: string, category: string): Promise<Partial<CanvasCard>> => {
    const cardTypes = ["strategy", "analysis", "plan", "metrics"] as const
    const randomType = cardTypes[Math.floor(Math.random() * cardTypes.length)]

    const richContent: CanvasCard["richContent"] = {}

    // Enhanced table generation with more realistic data
    if (
      message.toLowerCase().includes("tabla") ||
      message.toLowerCase().includes("datos") ||
      message.toLowerCase().includes("comparar") ||
      message.toLowerCase().includes("table")
    ) {
      const tableData =
        category === "deep-scope"
          ? {
              headers: ["Estrategia", "Alcance", "Impacto", "Prioridad"],
              rows: [
                ["SEO Optimization", "Global", "Alto", "🔴 Crítico"],
                ["Content Marketing", "Regional", "Medio", "🟡 Importante"],
                ["Social Media", "Local", "Alto", "🟢 Normal"],
                ["Email Campaigns", "Global", "Medio", "🟡 Importante"],
              ],
            }
          : {
              headers: ["Métrica", "Q1 2024", "Q2 2024", "Q3 2024", "Tendencia"],
              rows: [
                ["Ingresos", "$125K", "$150K", "$175K", "📈 +40%"],
                ["Usuarios Activos", "1,200", "1,800", "2,400", "📈 +100%"],
                ["Tasa Conversión", "2.5%", "3.1%", "3.8%", "📈 +52%"],
                ["Retención", "85%", "87%", "89%", "📈 +4.7%"],
              ],
            }

      richContent.tables = [tableData]
    }

    // Enhanced chart generation with category-specific data
    if (
      message.toLowerCase().includes("gráfico") ||
      message.toLowerCase().includes("análisis") ||
      message.toLowerCase().includes("métricas") ||
      message.toLowerCase().includes("chart") ||
      message.toLowerCase().includes("graph")
    ) {
      const chartType =
        message.toLowerCase().includes("pie") || message.toLowerCase().includes("circular")
          ? "pie"
          : message.toLowerCase().includes("line") || message.toLowerCase().includes("línea")
            ? "line"
            : message.toLowerCase().includes("bar") || message.toLowerCase().includes("barra")
              ? "bar"
              : "bar"

      const chartData =
        category === "deep-scope"
          ? [
              { label: "Análisis Competitivo", value: 35, color: "#3B82F6" },
              { label: "Investigación Mercado", value: 28, color: "#10B981" },
              { label: "Estrategia Digital", value: 22, color: "#F59E0B" },
              { label: "Optimización SEO", value: 15, color: "#8B5CF6" },
            ]
          : [
              { label: "Ventas Online", value: 145, color: "#3B82F6" },
              { label: "Marketing Digital", value: 89, color: "#10B981" },
              { label: "Soporte Cliente", value: 67, color: "#F59E0B" },
              { label: "Desarrollo", value: 45, color: "#8B5CF6" },
            ]

      richContent.charts = [
        {
          id: `chart-${Date.now()}`,
          type: chartType,
          title: `Análisis ${category === "deep-scope" ? "Estratégico" : "de Rendimiento"}`,
          data: chartData,
          library: "quickchart",
          interactive: false,
          optimized: true,
        },
      ]
    }

    // Enhanced AI image generation with category-specific prompts
    if (
      message.toLowerCase().includes("imagen") ||
      message.toLowerCase().includes("visual") ||
      message.toLowerCase().includes("diseño") ||
      message.toLowerCase().includes("generar imagen") ||
      message.toLowerCase().includes("image")
    ) {
      const categoryPrompts = {
        "deep-scope": "strategic business analysis dashboard with charts and data visualization",
        "blueprint-ai": "AI technology blueprint with neural networks and data flows",
        nextleap: "innovation and growth visualization with upward trending elements",
        flowops: "operational workflow diagram with process optimization elements",
      }

      const basePrompt =
        categoryPrompts[category as keyof typeof categoryPrompts] || "professional business visualization"
      const imagePrompt = `${basePrompt}, related to ${message}, modern corporate style, clean design`

      console.log("[v0] Generating AI image with prompt:", imagePrompt)
      const aiImageUrl = await generateAIImage(imagePrompt)

      richContent.images = [
        {
          src: aiImageUrl || "/business-visualization.png",
          alt: `AI generated visualization for ${category}`,
          caption: `Imagen generada por IA: "${message}" - Categoría: ${category}`,
        },
      ]
    }

    return {
      title: `${category === "deep-scope" ? "Análisis Estratégico" : "Nueva Tarjeta"} - ${category}`,
      content: `Contenido generado para: "${message}"\n\nEsta tarjeta incluye visualizaciones interactivas y datos procesados usando tecnologías modernas como QuickChart para gráficos optimizados y OpenAI para generación de imágenes.`,
      type: randomType,
      tags: [category, "AI Generated", "Interactive", "QuickChart", "Tailwind"],
      richContent,
    }
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isSubmitting) return

    setIsSubmitting(true)
    const message = chatMessage.trim()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch("https://stefannycobba.app.n8n.cloud/webhook/29abaeac-aa67-4b95-90c8-a0bc144668b6", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          user_name: userName,
          message: message,
          category: category,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      let webhookContent = ""
      if (response.ok) {
        const responseText = await response.text()
        if (responseText.trim()) {
          try {
            const responseData = JSON.parse(responseText)
            webhookContent = responseData.content || responseData.message || responseText
          } catch {
            webhookContent = responseText
          }
        }
      } else {
        console.warn(`Webhook responded with status: ${response.status}`)
      }

      // Generate new card with rich content
      const baseCard = await generateCardWithRichContent(message, category)
      const newCard: CanvasCard = {
        id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: Math.random() * (canvasSize.width - 300),
        y: Math.random() * (canvasSize.height - 200),
        width: 350,
        height: baseCard.richContent ? 450 : 300,
        cardInput: "",
        chatId: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userName,
        content: webhookContent || baseCard.content || `Respuesta para: "${message}"`,
        ...baseCard,
      }

      setCanvasCards((prev) => [...prev, newCard])
      setChatMessage("")
    } catch (error) {
      console.error("Error sending message:", error)

      const baseCard = await generateCardWithRichContent(message, category)
      const newCard: CanvasCard = {
        id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: Math.random() * (canvasSize.width - 300),
        y: Math.random() * (canvasSize.height - 200),
        width: 350,
        height: baseCard.richContent ? 450 : 300,
        cardInput: "",
        chatId: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userName,
        content: baseCard.content || `Mensaje: "${message}" (Webhook no disponible)`,
        ...baseCard,
      }

      setCanvasCards((prev) => [...prev, newCard])
      setChatMessage("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeCard = (cardId: string) => {
    setCanvasCards((prev) => prev.filter((card) => card.id !== cardId))
  }

  const handleCardInputChange = (cardId: string, value: string) => {
    setCardInputs((prev) => ({ ...prev, [cardId]: value }))
  }

  const handleCardInputSubmit = async (cardId: string) => {
    const card = canvasCards.find((c) => c.id === cardId)
    const inputValue = cardInputs[cardId] || ""
    if (!card || !inputValue.trim()) return

    const message = inputValue.trim()
    setCardInputs((prev) => ({ ...prev, [cardId]: "" }))

    let controller: AbortController | null = null
    let timeoutId: NodeJS.Timeout | null = null

    try {
      controller = new AbortController()
      // Increase timeout to 30 seconds for better reliability
      timeoutId = setTimeout(() => {
        if (controller) {
          controller.abort()
        }
      }, 30000)

      const response = await fetch("https://stefannycobba.app.n8n.cloud/webhook/29abaeac-aa67-4b95-90c8-a0bc144668b6", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          chat_id: card.chatId,
          user_name: card.userName,
          message: message,
          category: category,
        }),
        signal: controller.signal,
      })

      // Clear timeout on successful response
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      if (response.ok) {
        const responseText = await response.text()
        let responseContent = responseText

        try {
          const jsonResponse = JSON.parse(responseText)
          responseContent = jsonResponse.message || jsonResponse.response || responseText
        } catch {
          // Use plain text response
        }

        // Update card content with response
        setCanvasCards((prev) =>
          prev.map((c) => (c.id === cardId ? { ...c, content: c.content + `\n\n${responseContent}` } : c)),
        )
      } else {
        console.warn(`Webhook responded with status: ${response.status}`)
        // Add fallback response for non-200 status
        setCanvasCards((prev) =>
          prev.map((c) =>
            c.id === cardId
              ? { ...c, content: c.content + `\n\nError: Webhook returned status ${response.status}` }
              : c,
          ),
        )
      }
    } catch (error) {
      // Clear timeout in case of error
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      console.error("Error sending card input to webhook:", error)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error("Request timed out after 30 seconds")
          // Add timeout message to card
          setCanvasCards((prev) =>
            prev.map((c) =>
              c.id === cardId
                ? { ...c, content: c.content + `\n\nTimeout: La solicitud tardó demasiado en responder` }
                : c,
            ),
          )
        } else {
          console.error("Network error or webhook unavailable:", error.message)
          // Add error message to card
          setCanvasCards((prev) =>
            prev.map((c) => (c.id === cardId ? { ...c, content: c.content + `\n\nError: ${error.message}` } : c)),
          )
        }
      } else {
        console.error("Unknown error occurred")
        setCanvasCards((prev) =>
          prev.map((c) =>
            c.id === cardId ? { ...c, content: c.content + `\n\nError desconocido al procesar la solicitud` } : c,
          ),
        )
      }
    }
  }

  const handleCardInputKeyDown = (e: React.KeyboardEvent, cardId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleCardInputSubmit(cardId)
    }
    if (e.key === "Escape") {
      setChatMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSendMessage()
    }
  }

  const handleBackToMain = () => {
    router.push(`/?category=${category}`)
  }

  const handleHome = () => {
    router.push(`/?category=${category}`)
  }

  const handleCreateNewChat = () => {
    const baseCardPromise = generateCardWithRichContent("Nueva conversación", category)
    baseCardPromise.then((baseCard) => {
      const newCard: CanvasCard = {
        id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: Math.random() * (canvasSize.width - 300),
        y: Math.random() * (canvasSize.height - 200),
        width: 350,
        height: baseCard.richContent ? 450 : 300,
        cardInput: "",
        chatId: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userName,
        content: "Nueva conversación iniciada. Escribe tu mensaje abajo para comenzar.",
        title: `Nueva Conversación - ${category}`,
        type: "strategy",
        tags: [category, "New Chat"],
        richContent: undefined,
      }

      setCanvasCards((prev) => [...prev, newCard])
    })
  }

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
      <ChartPerformanceMonitor enabled={process.env.NODE_ENV === "development"} position="top-left" />

      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-4 relative z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Navigation buttons before the logo */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleBackToMain} className="hover:bg-gray-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleHome} className="hover:bg-gray-100">
                    <Home className="w-4 h-4 mr-2" />
                    Inicio
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/maia-logo.png" alt="MaiA" width={200} height={100} className="h-8 w-auto" priority />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">51%</span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: "51%" }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  Get Extension
                </Button>
                <Button variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
                <Image
                  src="/utopiq-logo.png"
                  alt="UTOPIQ Tech Digital Lab"
                  width={170}
                  height={51}
                  className="h-8 w-auto ml-4"
                  priority
                />
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    OA
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    +1
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed left-6 top-24 z-40 space-y-3">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.name}
                  onClick={() => setSelectedTool(tool.name)}
                  className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 min-w-[140px] ${
                    selectedTool === tool.name
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">{tool.name}</span>
                </button>
              )
            })}

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 px-2">Gallery</h3>
            </div>
          </div>

          {/* Enhanced Zoom Controls */}
          <div className="fixed top-20 right-6 z-40 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
              className="w-10 h-10 p-0 bg-white shadow-md hover:shadow-lg disabled:opacity-50"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <div className="text-xs text-center font-medium px-2 py-1 bg-gray-100 rounded min-w-[60px]">
              {Math.round(zoomLevel * 100)}%
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomIndex <= 0}
              className="w-10 h-10 p-0 bg-white shadow-md hover:shadow-lg disabled:opacity-50"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCenterView}
              className="w-10 h-10 p-0 bg-white shadow-md hover:shadow-lg"
              title="Centrar vista"
            >
              <Target className="w-4 h-4" />
            </Button>
          </div>

          {/* Canvas Area */}
          <div
            ref={canvasRef}
            className="flex-1 p-6 overflow-hidden relative bg-gray-50"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isPanning ? "grabbing" : "default" }}
          >
            <div
              className={`relative w-full h-full origin-top-left ${isTransitioning ? "transition-transform duration-300 ease-out" : ""}`}
              style={{
                transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
                transformOrigin: "0 0",
                willChange: isTransitioning ? "transform" : "auto",
              }}
            >
              {canvasCards
                .filter((card) => isElementVisible(card)) // Only render visible cards for performance
                .map((card) => (
                  <Card
                    key={card.id}
                    className={`absolute cursor-move border-2 shadow-lg transition-all duration-200 select-none ${
                      selectedCard === card.id ? "border-green-500 shadow-green-200" : "border-gray-200"
                    } ${isDragging === card.id ? "shadow-2xl scale-105" : ""}`}
                    style={{
                      left: card.x,
                      top: card.y,
                      width: Math.max(280, Math.min(card.width, viewport.width * 0.9)),
                      height: Math.max(200, Math.min(card.height, viewport.height * 0.8)),
                      transform: "translate3d(0, 0, 0)",
                      zIndex: isDragging === card.id ? 50 : selectedCard === card.id ? 40 : 30,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, card.id)}
                    onClick={(e) => {
                      const target = e.target as HTMLElement
                      if (!target.closest("input") && !target.closest("textarea") && !target.closest("button")) {
                        setSelectedCard(card.id)
                      }
                    }}
                  >
                    {/* Resize handles */}
                    {selectedCard === card.id && (
                      <>
                        <div
                          className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize z-60"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setResizingCard(card.id)
                            setResizeHandle("top-left")
                            setResizeStart({
                              x: card.x,
                              y: card.y,
                              width: card.width,
                              height: card.height,
                            })
                          }}
                        />
                        <div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize z-60"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setResizingCard(card.id)
                            setResizeHandle("top-right")
                            setResizeStart({
                              x: card.x,
                              y: card.y,
                              width: card.width,
                              height: card.height,
                            })
                          }}
                        />
                        <div
                          className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize z-60"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setResizingCard(card.id)
                            setResizeHandle("bottom-left")
                            setResizeStart({
                              x: card.x,
                              y: card.y,
                              width: card.width,
                              height: card.height,
                            })
                          }}
                        />
                        <div
                          className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize z-60"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setResizingCard(card.id)
                            setResizeHandle("bottom-right")
                            setResizeStart({
                              x: card.x,
                              y: card.y,
                              width: card.width,
                              height: card.height,
                            })
                          }}
                        />
                        <div
                          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize z-60"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setResizingCard(card.id)
                            setResizeHandle("top")
                            setResizeStart({
                              x: card.x,
                              y: card.y,
                              width: card.width,
                              height: card.height,
                            })
                          }}
                        />
                        <div
                          className="absolute -bottom-1 left-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize z-60"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setResizingCard(card.id)
                            setResizeHandle("bottom")
                            setResizeStart({
                              x: card.x,
                              y: card.y,
                              width: card.width,
                              height: card.height,
                            })
                          }}
                        />
                        <div
                          className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize z-60"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setResizingCard(card.id)
                            setResizeHandle("left")
                            setResizeStart({
                              x: card.x,
                              y: card.y,
                              width: card.width,
                              height: card.height,
                            })
                          }}
                        />
                        <div
                          className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize z-60"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            setResizingCard(card.id)
                            setResizeHandle("right")
                            setResizeStart({
                              x: card.x,
                              y: card.y,
                              width: card.width,
                              height: card.height,
                            })
                          }}
                        />
                      </>
                    )}

                    <CardHeader className="pb-2 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-800">{card.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeCard(card.id)
                          }}
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardHeader>

                    <div className="flex flex-col h-full">
                      <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 pb-2">
                        <div className="space-y-2 sm:space-y-3">
                          <div className="prose prose-sm max-w-none">
                            <HTMLContentFormatter content={card.content} />
                          </div>

                          {card.richContent && (
                            <div className="space-y-3 sm:space-y-4">
                              <RichContentRenderer richContent={card.richContent} />
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                            {(card.tags || []).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 sm:mt-2">
                            {card.type === "strategy"
                              ? "Estrategia"
                              : card.type === "analysis"
                                ? "Análisis"
                                : card.type === "plan"
                                  ? "Planificación"
                                  : "Métricas"}
                          </div>
                        </div>
                      </CardContent>

                      <div className="flex-shrink-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
                        <div className="p-2 sm:p-3">
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 sm:px-3 py-2 border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                            <Input
                              placeholder="Agregar nota o comentario..."
                              value={cardInputs[card.id] || ""}
                              onChange={(e) => handleCardInputChange(card.id, e.target.value)}
                              onKeyDown={(e) => handleCardInputKeyDown(e, card.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-transparent border-none outline-none text-sm placeholder:text-gray-500 flex-1 focus:ring-0 focus:border-none shadow-none min-w-0"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCardInputSubmit(card.id)
                              }}
                              className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200 rounded-md flex-shrink-0"
                              disabled={!(cardInputs[card.id] || "").trim()}
                            >
                              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>

          {/* Floating Chat Input */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            <button
              onClick={handleCreateNewChat}
              className="bg-white hover:bg-gray-50 text-gray-700 rounded-full px-6 py-3 shadow-lg border border-gray-200 transition-all duration-200 flex items-center gap-2 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>

            {/* Disclaimer text positioned below */}
            <p className="text-xs text-gray-500 text-center">AI can make mistakes. Check important info</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoveInterface
export { CoveInterface }
