"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, Paperclip, X, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

interface Mention {
  id: string
  title: string
  subtitle: string
}

const mockCards: Mention[] = [
  { id: "1", title: "Tarjeta de Proyecto 1", subtitle: "Proyecto de ejemplo" },
  { id: "2", title: "Tarjeta de Proyecto 2", subtitle: "Otro proyecto" },
  { id: "3", title: "Tarjeta de Proyecto 3", subtitle: "Tercer proyecto" },
]

const quickSuggestions = ["Resume esto", "Genera 3 ideas", "Dame próximos pasos", "Explica en detalle", "Crea un plan"]

export function CoveChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy tu asistente de chat. Puedes usar @menciones para referenciar tarjetas específicas.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [selectedCards, setSelectedCards] = useState<string[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mentionsRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }

    // Handle @mentions
    const lastAtIndex = value.lastIndexOf("@")
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true)
      setMentionQuery("")
    } else if (lastAtIndex !== -1) {
      const query = value.slice(lastAtIndex + 1)
      if (query.includes(" ")) {
        setShowMentions(false)
      } else {
        setShowMentions(true)
        setMentionQuery(query)
      }
    } else {
      setShowMentions(false)
    }
  }

  const handleMentionSelect = (mention: Mention) => {
    const lastAtIndex = inputValue.lastIndexOf("@")
    const newValue = inputValue.slice(0, lastAtIndex) + `@${mention.title} `
    setInputValue(newValue)
    setShowMentions(false)
    setSelectedCards((prev) => [...prev, mention.id])
    textareaRef.current?.focus()
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")
    setIsStreaming(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Entiendo tu consulta. Basándome en el contexto proporcionado, puedo ayudarte con eso.",
        "Perfecto, he procesado la información de las tarjetas mencionadas.",
        "Aquí tienes algunas ideas basadas en tu solicitud y el contexto actual.",
        "He analizado el contenido y puedo ofrecerte las siguientes sugerencias.",
      ]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsStreaming(false)
    }, 2000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    textareaRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredMentions = mockCards.filter((card) => card.title.toLowerCase().includes(mentionQuery.toLowerCase()))

  const contextText =
    selectedCards.length > 0
      ? `Contexto: ${selectedCards.length} tarjeta${selectedCards.length > 1 ? "s" : ""} seleccionada${selectedCards.length > 1 ? "s" : ""}`
      : "Sin contexto"

  return (
    <>
      {/* Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-2xl bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageSquare className="h-6 w-6 text-white" />}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] md:w-96">
          <Card className="bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200/50">
              <h3 className="font-semibold text-slate-900">Cove-like Chat</h3>
              <p className="text-sm text-slate-500">{contextText}</p>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      message.sender === "user"
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 shadow-sm",
                    )}
                  >
                    {message.sender === "assistant" && (
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6 mt-1">
                          <AvatarFallback className="text-xs bg-slate-100">AI</AvatarFallback>
                        </Avatar>
                        <div className="text-sm text-slate-700">{message.content}</div>
                      </div>
                    )}
                    {message.sender === "user" && <div className="text-sm">{message.content}</div>}
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-slate-100">AI</AvatarFallback>
                      </Avatar>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-2 border-t border-slate-200/50">
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full border border-slate-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200/50 relative">
              {/* Mentions Dropdown */}
              {showMentions && (
                <div
                  ref={mentionsRef}
                  className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-32 overflow-y-auto z-10"
                >
                  {filteredMentions.map((mention) => (
                    <button
                      key={mention.id}
                      onClick={() => handleMentionSelect(mention)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="font-medium text-sm text-slate-900">{mention.title}</div>
                      <div className="text-xs text-slate-500">{mention.subtitle}</div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2">
                <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0">
                  <Paperclip className="h-4 w-4" />
                </Button>

                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe aquí… usa @ para mencionar tarjetas"
                    className="w-full resize-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[2.5rem] max-h-24"
                    rows={1}
                  />
                </div>

                {isStreaming ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsStreaming(false)}
                    className="shrink-0 h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    size="sm"
                    className="shrink-0 h-8 px-3 bg-slate-900 hover:bg-slate-800"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    <span className="text-xs">Enviar</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Mobile Overlay */}
      {isOpen && <div className="md:hidden fixed inset-0 bg-black/20 z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
