import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chat_id, user_name, message, category } = body

    // Basic validation
    if (!chat_id || !user_name || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate a response based on the message content
    let response = `Procesando mensaje: "${message}"`

    if (message.toLowerCase().includes("tabla")) {
      response = "He generado una tabla con los datos solicitados."
    } else if (message.toLowerCase().includes("gráfico") || message.toLowerCase().includes("chart")) {
      response = "He creado un gráfico basado en tu solicitud."
    } else if (message.toLowerCase().includes("imagen")) {
      response = "He añadido una imagen relacionada con tu consulta."
    }

    return NextResponse.json({
      content: response,
      message: response,
      chat_id,
      user_name,
      category,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("API Chat Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
