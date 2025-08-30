"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./AuthProvider"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Pencil, Trash2, Check, X } from "lucide-react"

interface ProjectCard {
  id: string
  title: string
  description: string
  category: "deepscope" | "blueprint" | "nextleap" | "flowops"
}

interface ProjectCardProps {
  card: ProjectCard
  colorScheme: {
    bg: string
    border: string
    title: string
    description: string
    id: string
  }
  onEdit?: (id: string, title: string, description: string) => void
  onDelete?: (id: string) => void
}

export default function ProjectCard({ card, colorScheme, onEdit, onDelete }: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(card.title)
  const [editDescription, setEditDescription] = useState(card.description)
  const router = useRouter()
  const { user } = useAuth()

  const navigateToCanvas = () => {
    if (isEditing) return // Don't navigate when editing

    const categoryMap: { [key: string]: string } = {
      deepscope: "deep-scope",
      blueprint: "blueprint-ai",
      nextleap: "nextleap",
      flowops: "flowops",
    }

    const chatId = card.id // Use the card's ID as the chat_id
    const userName = user?.name || user?.email || "Usuario"

    router.push(`/canvas/${categoryMap[card.category]}?chat_id=${chatId}&user_name=${encodeURIComponent(userName)}`)
  }

  const handleSave = () => {
    if (onEdit) {
      onEdit(card.id, editTitle, editDescription)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(card.title)
    setEditDescription(card.description)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (onDelete && confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      onDelete(card.id)
    }
  }

  return (
    <Card
      className={`p-6 shadow-sm border-2 transition-all duration-200 hover:shadow-md relative group cursor-pointer ${colorScheme.bg} ${colorScheme.border}`}
      onClick={navigateToCanvas}
    >
      <div
        className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent card navigation when clicking edit/delete buttons
      >
        {!isEditing && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-white/20 text-white"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-red-500/20 text-white hover:text-red-200"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </>
        )}
        {isEditing && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-green-500/20 text-white hover:text-green-200"
              onClick={handleSave}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-red-500/20 text-white hover:text-red-200"
              onClick={handleCancel}
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>

      {isEditing ? (
        <div
          className="space-y-3 pr-16"
          onClick={(e) => e.stopPropagation()} // Prevent card navigation when editing
        >
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            placeholder="Título de la tarjeta"
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[80px]"
            placeholder="Descripción de la tarjeta"
          />
        </div>
      ) : (
        <div className="pr-16">
          <h3 className={`font-semibold mb-2 ${colorScheme.title}`}>{card.title}</h3>
          <p className={`text-sm mb-4 ${colorScheme.description}`}>{card.description}</p>
        </div>
      )}

      <div className={`text-xs ${colorScheme.id}`}>ID: {card.id}</div>
    </Card>
  )
}
