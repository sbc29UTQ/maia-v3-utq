"use client"

import { CoveInterface } from "@/components/CoveInterface"
import { notFound, useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface CanvasClientPageProps {
  category: string
}

const validCategories = ["deep-scope", "blueprint-ai", "nextleap", "flowops"]

function CanvasContent({ category }: { category: string }) {
  const searchParams = useSearchParams()
  const chatId = searchParams.get("chat_id") || ""
  const userName = searchParams.get("user_name") || ""

  return <CoveInterface chatId={chatId} userName={userName} category={category} />
}

export default function CanvasClientPage({ category }: CanvasClientPageProps) {
  if (!validCategories.includes(category)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        <CanvasContent category={category} />
      </Suspense>
    </div>
  )
}
