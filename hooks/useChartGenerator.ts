"use client"

import { useState, useCallback } from "react"
import { useChartStore } from "@/lib/chart-store"

interface ChartGeneratorOptions {
  defaultType?: "line" | "bar" | "pie" | "area" | "scatter"
  defaultLibrary?: "recharts" | "chartjs" | "d3" | "apex"
  autoSave?: boolean
}

export function useChartGenerator(options: ChartGeneratorOptions = {}) {
  const { defaultType = "bar", defaultLibrary = "recharts", autoSave = true } = options
  const { addChart } = useChartStore()
  const [isGenerating, setIsGenerating] = useState(false)

  const generateSampleData = useCallback((type: string, count = 6) => {
    const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const products = ["Product A", "Product B", "Product C", "Product D", "Product E"]

    switch (type) {
      case "sales":
        return Array.from({ length: count }, (_, i) => ({
          name: categories[i] || `Month ${i + 1}`,
          value: Math.floor(Math.random() * 10000) + 1000,
          category: "sales",
        }))

      case "performance":
        return Array.from({ length: count }, (_, i) => ({
          name: products[i] || `Item ${i + 1}`,
          value: Math.floor(Math.random() * 100) + 10,
          category: "performance",
        }))

      case "analytics":
        return Array.from({ length: count }, (_, i) => ({
          name: `Week ${i + 1}`,
          value: Math.floor(Math.random() * 1000) + 100,
          category: "analytics",
        }))

      default:
        return Array.from({ length: count }, (_, i) => ({
          name: `Item ${i + 1}`,
          value: Math.floor(Math.random() * 100) + 1,
          category: "default",
        }))
    }
  }, [])

  const generateChart = useCallback(
    async (
      prompt: string,
      chartType?: "line" | "bar" | "pie" | "area" | "scatter",
      library?: "recharts" | "chartjs" | "d3" | "apex",
    ) => {
      setIsGenerating(true)

      try {
        // Analyze prompt to determine data type and chart configuration
        const dataType = prompt.toLowerCase().includes("sales")
          ? "sales"
          : prompt.toLowerCase().includes("performance")
            ? "performance"
            : prompt.toLowerCase().includes("analytics")
              ? "analytics"
              : "default"

        const inferredChartType =
          chartType ||
          (prompt.toLowerCase().includes("trend")
            ? "line"
            : prompt.toLowerCase().includes("comparison")
              ? "bar"
              : prompt.toLowerCase().includes("distribution")
                ? "pie"
                : defaultType)

        const data = generateSampleData(dataType, 6)

        const chartConfig = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top" as const,
            },
            title: {
              display: true,
              text: prompt,
            },
          },
        }

        const chartId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const chartData = {
          id: chartId,
          type: inferredChartType,
          data,
          config: chartConfig,
          lastUpdated: Date.now(),
        }

        if (autoSave) {
          addChart(chartData)
        }

        setIsGenerating(false)
        return chartData
      } catch (error) {
        setIsGenerating(false)
        throw error
      }
    },
    [defaultType, defaultLibrary, autoSave, addChart, generateSampleData],
  )

  const generateMultipleCharts = useCallback(
    async (prompts: string[]) => {
      setIsGenerating(true)

      try {
        const charts = await Promise.all(prompts.map((prompt) => generateChart(prompt)))

        setIsGenerating(false)
        return charts
      } catch (error) {
        setIsGenerating(false)
        throw error
      }
    },
    [generateChart],
  )

  return {
    generateChart,
    generateMultipleCharts,
    generateSampleData,
    isGenerating,
  }
}
