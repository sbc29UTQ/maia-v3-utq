"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, Paperclip, X, Square } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Avatar } from "./ui/avatar"
import { ScrollArea } from "./ui/scroll-area"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

interface ProjectCard {
  id: string
  title: string
  subtitle: string
  category: string
}

interface Mention {
  cardId: string
  cardTitle: string
  position: number
}

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
}

interface ChatWidgetProps {
  onCreateCanvasCard?: (card: CanvasCard) => void
  userName?: string
}

export function ChatWidget({ onCreateCanvasCard, userName = "Usuario" }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy? Puedes referenciar cualquier tarjeta usando @menciones.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedCards] = useState<ProjectCard[]>([
    { id: "producto-001", title: "Tarjeta de Producto", subtitle: "Deep Scope", category: "deepscope" },
    { id: "roadmap-004", title: "Roadmap Técnico", subtitle: "Deep Scope", category: "deepscope" },
    { id: "analisis-002", title: "Análisis de Mercado", subtitle: "Blueprint AI", category: "blueprint" },
    { id: "finanzas-005", title: "Análisis Financiero", subtitle: "Blueprint AI", category: "blueprint" },
    { id: "marketing-003", title: "Plan de Marketing", subtitle: "NextLeap", category: "nextleap" },
    { id: "equipo-006", title: "Equipo y Recursos", subtitle: "NextLeap", category: "nextleap" },
    { id: "workflow-007", title: "Automatización de Procesos", subtitle: "FlowOps", category: "flowops" },
    { id: "monitoring-008", title: "Monitoreo y Alertas", subtitle: "FlowOps", category: "flowops" },
  ])
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)

  const [createdCanvasCards, setCreatedCanvasCards] = useState<CanvasCard[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickSuggestions = ["Resume esto", "Genera 3 ideas", "Dame próximos pasos", "Explica más detalles"]

  // Paleta de colores UTOPIQ actualizada con verdes
  const categoryColors = {
    deepscope: "bg-green-100 text-green-800",
    blueprint: "bg-lime-100 text-lime-800",
    nextleap: "bg-emerald-100 text-emerald-800",
    flowops: "bg-teal-100 text-teal-800",
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Handle @mention detection
  useEffect(() => {
    const text = inputValue
    const cursorPos = cursorPosition
    const beforeCursor = text.substring(0, cursorPos)
    const atIndex = beforeCursor.lastIndexOf("@")

    if (atIndex !== -1 && atIndex === beforeCursor.length - 1) {
      setShowMentionDropdown(true)
      setMentionQuery("")
    } else if (atIndex !== -1) {
      const query = beforeCursor.substring(atIndex + 1)
      if (query.length > 0 && !query.includes(" ")) {
        setShowMentionDropdown(true)
        setMentionQuery(query)
      } else {
        setShowMentionDropdown(false)
      }
    } else {
      setShowMentionDropdown(false)
    }
  }, [inputValue, cursorPosition])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    setCursorPosition(e.target.selectionStart)
  }

  const handleMentionSelect = (card: ProjectCard) => {
    const text = inputValue
    const cursorPos = cursorPosition
    const beforeCursor = text.substring(0, cursorPos)
    const afterCursor = text.substring(cursorPos)
    const atIndex = beforeCursor.lastIndexOf("@")

    const newText = beforeCursor.substring(0, atIndex) + `@${card.title} ` + afterCursor

    setInputValue(newText)
    setShowMentionDropdown(false)

    // Focus the textarea using a timeout to ensure the DOM has updated
    setTimeout(() => {
      const textarea = document.querySelector('textarea[placeholder*="Escribe aquí"]') as HTMLTextAreaElement
      if (textarea) {
        textarea.focus()
      }
    }, 0)
  }

  const generateCanvasCard = (message: string): CanvasCard => {
    const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const cardId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("tabla") || lowerMessage.includes("table")) {
      return {
        id: cardId,
        title: "Análisis con Tabla",
        content: `Tabla generada para: "${message}"`,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        width: 350,
        height: 300,
        type: "analysis",
        tags: ["Tabla", "Datos", "Análisis"],
        cardInput: "",
        chatId,
        userName,
      }
    } else if (lowerMessage.includes("gráfico") || lowerMessage.includes("chart")) {
      return {
        id: cardId,
        title: "Gráfico de Rendimiento",
        content: `Gráfico generado para: "${message}"`,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        width: 320,
        height: 350,
        type: "metrics",
        tags: ["Gráfico", "Métricas", "Visualización"],
        cardInput: "",
        chatId,
        userName,
      }
    } else if (lowerMessage.includes("estrategia") || lowerMessage.includes("strategy")) {
      return {
        id: cardId,
        title: "Estrategia Digital",
        content: `Estrategia creada para: "${message}"`,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        width: 400,
        height: 350,
        type: "strategy",
        tags: ["Estrategia", "Digital", "Planificación"],
        cardInput: "",
        chatId,
        userName,
      }
    } else {
      return {
        id: cardId,
        title: "Nueva Tarjeta",
        content: `Contenido generado para: "${message}"`,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        width: 320,
        height: 280,
        type: "plan",
        tags: ["General", "Contenido"],
        cardInput: "",
        chatId,
        userName,
      }
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])

    const canvasCard = generateCanvasCard(inputValue)
    setCreatedCanvasCards((prev) => [...prev, canvasCard])

    if (onCreateCanvasCard) {
      onCreateCanvasCard(canvasCard)
    }

    setInputValue("")
    setIsStreaming(true)

    try {
      const webhookResponse = await fetch(
        "https://stefannycobba.app.n8n.cloud/webhook/29abaeac-aa67-4b95-90c8-a0bc144668b6",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: canvasCard.chatId,
            user_name: canvasCard.userName,
            message: inputValue,
          }),
        },
      )

      let responseContent =
        "Gracias por tu mensaje. He procesado la información y creado una nueva tarjeta en el canvas."

      if (webhookResponse.ok) {
        const responseText = await webhookResponse.text()
        if (responseText.trim()) {
          try {
            const responseData = JSON.parse(responseText)
            responseContent = responseData.response || responseData.message || responseText
          } catch {
            responseContent = responseText
          }
        }
      }

      setCreatedCanvasCards((prev) =>
        prev.map((card) => (card.id === canvasCard.id ? { ...card, content: responseContent } : card)),
      )

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `He creado una nueva tarjeta en el canvas con ID: ${canvasCard.chatId}. ${responseContent}`,
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsStreaming(false)
    } catch (error) {
      console.error("Error sending to webhook:", error)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "He creado una nueva tarjeta en el canvas, pero hubo un error al conectar con el servidor.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsStreaming(false)
    }
  }

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion)

    // Focus the textarea using DOM query since ref might not work
    setTimeout(() => {
      const textarea = document.querySelector('textarea[placeholder*="Escribe aquí"]') as HTMLTextAreaElement
      if (textarea) {
        textarea.focus()
      }
    }, 0)
  }

  const stopStreaming = () => {
    setIsStreaming(false)
  }

  const getContextText = () => {
    if (selectedCards.length === 0) return "Sin contexto"
    return `Contexto: ${selectedCards.length} tarjetas disponibles`
  }

  const filteredCards = selectedCards.filter(
    (card) =>
      card.title.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      card.subtitle.toLowerCase().includes(mentionQuery.toLowerCase()),
  )

  const renderMessage = (message: Message) => {
    const isUser = message.sender === "user"

    // Parse @mentions in content
    const parts = message.content.split(/(@[\w\s]+)/g)
    const parsedContent = parts.map((part, index) => {
      if (part.startsWith("@")) {
        const mentionedCard = selectedCards.find((card) => part.includes(card.title))
        const colorClass = mentionedCard
          ? categoryColors[mentionedCard.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"
          : "bg-gray-100 text-gray-800"

        return (
          <span
            key={index}
            className={`${colorClass} border border-current/20 rounded px-1 py-0.5 text-xs font-medium`}
          >
            {part}
          </span>
        )
      }
      return part
    })

    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <Avatar className="w-8 h-8 bg-gray-200 flex-shrink-0">
            <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs">AI</span>
            </div>
          </Avatar>
        )}
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
            isUser ? "bg-black text-white" : "bg-white border border-gray-200 shadow-sm"
          }`}
        >
          <div className="text-sm">{parsedContent}</div>
          <div className={`text-xs mt-1 ${isUser ? "text-gray-300" : "text-gray-500"}`}>
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-2xl bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:bg-green-700"
          size="icon"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div className="md:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />

          {/* Chat Container */}
          <div
            className="fixed z-50 md:bottom-24 md:right-6 md:w-96 md:h-[600px] 
                         max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:h-[70vh]"
          >
            <Card
              className="w-full h-full backdrop-blur-md bg-white/90 border border-white/20 shadow-2xl 
                         md:rounded-2xl max-md:rounded-t-2xl max-md:rounded-b-none
                         animate-in slide-in-from-bottom-4 fade-in duration-300"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Cove-like Chat</h3>
                    <p className="text-sm text-gray-500">{getContextText()}</p>
                    <p className="text-xs text-green-600">{createdCanvasCards.length} tarjetas creadas en canvas</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="md:hidden">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 h-0">
                <div className="p-4 space-y-4">
                  {messages.map(renderMessage)}
                  {isStreaming && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="w-8 h-8 bg-gray-200 flex-shrink-0">
                        <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs">AI</span>
                        </div>
                      </Avatar>
                      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Suggestions */}
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="px-3 py-1 text-sm bg-green-50 hover:bg-green-100 rounded-full border border-green-200 
                                transition-colors duration-150 text-green-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 relative">
                {/* Mention Dropdown */}
                {showMentionDropdown && filteredCards.length > 0 && (
                  <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
                    {filteredCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => handleMentionSelect(card)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{card.title}</div>
                            <div className="text-xs text-gray-500">{card.subtitle}</div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${categoryColors[card.category as keyof typeof categoryColors]}`}
                          >
                            {card.subtitle}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  <div className="flex-1 relative">
                    <div ref={textareaRef}>
                      <Textarea
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="Escribe aquí para crear una tarjeta en canvas..."
                        className="min-h-[2.5rem] max-h-24 resize-none rounded-xl border-gray-200"
                        rows={1}
                      />
                    </div>
                  </div>

                  {isStreaming ? (
                    <Button
                      onClick={stopStreaming}
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0 bg-transparent"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="flex-shrink-0 bg-green-600 text-white hover:bg-green-700"
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  )
}
