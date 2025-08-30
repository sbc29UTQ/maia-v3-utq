import { type NextRequest, NextResponse } from "next/server"

let openai: any = null

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    const OpenAI = require("openai")
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const client = getOpenAIClient()
    if (!client) {
      return NextResponse.json({ error: "OpenAI client not available" }, { status: 500 })
    }

    const { prompt, size = "1024x1024" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size as "1024x1024" | "1792x1024" | "1024x1792",
      quality: "standard",
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
