import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "sample"
  const count = Number.parseInt(searchParams.get("count") || "6")

  try {
    let data: any[] = []

    switch (type) {
      case "sales":
        data = generateSalesData(count)
        break
      case "performance":
        data = generatePerformanceData(count)
        break
      case "analytics":
        data = generateAnalyticsData(count)
        break
      default:
        data = generateSampleData(count)
    }

    return NextResponse.json({ data, type, timestamp: Date.now() })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate chart data" }, { status: 500 })
  }
}

function generateSalesData(count: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return Array.from({ length: count }, (_, i) => ({
    name: months[i] || `Month ${i + 1}`,
    value: Math.floor(Math.random() * 50000) + 10000,
    growth: (Math.random() - 0.5) * 20,
  }))
}

function generatePerformanceData(count: number) {
  const metrics = ["CPU", "Memory", "Disk", "Network", "Response Time", "Throughput"]
  return Array.from({ length: count }, (_, i) => ({
    name: metrics[i] || `Metric ${i + 1}`,
    value: Math.floor(Math.random() * 100) + 1,
    threshold: 80,
  }))
}

function generateAnalyticsData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 1000) + 100,
    users: Math.floor(Math.random() * 500) + 50,
    sessions: Math.floor(Math.random() * 800) + 80,
  }))
}

function generateSampleData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 100) + 1,
  }))
}
