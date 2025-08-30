export function generateChartId(): string {
  return `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatChartData(data: any[], type: "line" | "bar" | "pie" | "area" | "scatter") {
  switch (type) {
    case "pie":
      return data.map((item) => ({
        name: item.name || item.label,
        value: Number(item.value) || 0,
      }))

    case "scatter":
      return data.map((item) => ({
        x: Number(item.x) || 0,
        y: Number(item.y) || 0,
        name: item.name || item.label,
      }))

    default:
      return data.map((item) => ({
        name: item.name || item.label,
        value: Number(item.value) || 0,
      }))
  }
}

export function detectChartType(data: any[]): "line" | "bar" | "pie" | "area" | "scatter" {
  if (!data.length) return "bar"

  const firstItem = data[0]

  // Check if data has x,y coordinates (scatter plot)
  if (firstItem.x !== undefined && firstItem.y !== undefined) {
    return "scatter"
  }

  // Check if data represents parts of a whole (pie chart)
  const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0)
  if (data.length <= 8 && totalValue > 0) {
    const hasPercentages = data.some((item) => item.percentage !== undefined || (item.value / totalValue) * 100 > 5)
    if (hasPercentages) return "pie"
  }

  // Check if data represents time series (line chart)
  const hasTimeData = data.some(
    (item) => item.timestamp !== undefined || item.date !== undefined || /\d{4}/.test(item.name), // Year pattern
  )
  if (hasTimeData) return "line"

  // Default to bar chart
  return "bar"
}

export function optimizeChartData(data: any[], maxPoints = 100): any[] {
  if (data.length <= maxPoints) return data

  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, index) => index % step === 0)
}

export function aggregateChartData(data: any[], groupBy: string): any[] {
  const grouped = data.reduce(
    (acc, item) => {
      const key = item[groupBy] || "Other"
      if (!acc[key]) {
        acc[key] = { name: key, value: 0, count: 0 }
      }
      acc[key].value += item.value || 0
      acc[key].count += 1
      return acc
    },
    {} as Record<string, any>,
  )

  return Object.values(grouped)
}
