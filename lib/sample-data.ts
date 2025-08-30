export function generateSampleData(type: string, count = 6) {
  const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const products = ["Product A", "Product B", "Product C", "Product D", "Product E"]
  const metrics = ["CPU", "Memory", "Disk", "Network", "Response Time", "Throughput"]

  switch (type) {
    case "sales":
      return Array.from({ length: count }, (_, i) => ({
        name: categories[i] || `Month ${i + 1}`,
        value: Math.floor(Math.random() * 10000) + 1000,
        category: "sales",
        growth: (Math.random() - 0.5) * 20,
      }))

    case "performance":
      return Array.from({ length: count }, (_, i) => ({
        name: metrics[i] || `Metric ${i + 1}`,
        value: Math.floor(Math.random() * 100) + 10,
        category: "performance",
        threshold: 80,
      }))

    case "analytics":
      return Array.from({ length: count }, (_, i) => ({
        name: `Week ${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 100,
        category: "analytics",
        users: Math.floor(Math.random() * 500) + 50,
        sessions: Math.floor(Math.random() * 800) + 80,
      }))

    case "products":
      return Array.from({ length: count }, (_, i) => ({
        name: products[i] || `Product ${i + 1}`,
        value: Math.floor(Math.random() * 100) + 10,
        category: "products",
        revenue: Math.floor(Math.random() * 50000) + 5000,
      }))

    case "financial":
      return Array.from({ length: count }, (_, i) => ({
        name: categories[i] || `Q${Math.floor(i / 3) + 1}`,
        value: Math.floor(Math.random() * 100000) + 10000,
        category: "financial",
        profit: Math.floor(Math.random() * 20000) + 2000,
      }))

    case "marketing":
      return Array.from({ length: count }, (_, i) => ({
        name: `Campaign ${i + 1}`,
        value: Math.floor(Math.random() * 5000) + 500,
        category: "marketing",
        ctr: Math.random() * 5 + 1,
        conversion: Math.random() * 10 + 2,
      }))

    default:
      return Array.from({ length: count }, (_, i) => ({
        name: `Item ${i + 1}`,
        value: Math.floor(Math.random() * 100) + 1,
        category: "default",
      }))
  }
}

export function generateTimeSeriesData(days = 30) {
  const data = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    data.push({
      name: date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
      value: Math.floor(Math.random() * 1000) + 100,
      date: date.toISOString(),
      trend: Math.random() > 0.5 ? "up" : "down",
    })
  }

  return data
}

export function generateScatterData(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Point ${i + 1}`,
    x: Math.floor(Math.random() * 100) + 1,
    y: Math.floor(Math.random() * 100) + 1,
    size: Math.floor(Math.random() * 20) + 5,
  }))
}

export function generatePieData(categories: string[] = ["Category A", "Category B", "Category C", "Category D"]) {
  const total = 100
  let remaining = total

  return categories.map((category, index) => {
    const isLast = index === categories.length - 1
    const value = isLast ? remaining : Math.floor(Math.random() * remaining * 0.6) + 1
    remaining -= value

    return {
      name: category,
      value: Math.max(value, 1),
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    }
  })
}
