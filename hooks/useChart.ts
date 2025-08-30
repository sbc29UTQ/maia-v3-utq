"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { useChartStore } from "@/lib/chart-store"

interface UseChartOptions {
  refreshInterval?: number
  revalidateOnFocus?: boolean
  fallbackData?: any
}

export function useChart(chartId: string, options: UseChartOptions = {}) {
  const { getChart, updateChart } = useChartStore()

  const { data, error, isLoading, mutate } = useSWR(
    chartId ? `/api/charts/${chartId}` : null,
    async (url: string) => {
      const cachedChart = getChart(chartId)
      if (cachedChart && Date.now() - cachedChart.lastUpdated < 60000) {
        return cachedChart
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch chart data")
      return response.json()
    },
    {
      refreshInterval: options.refreshInterval || 30000,
      revalidateOnFocus: options.revalidateOnFocus ?? false,
      fallbackData: options.fallbackData,
      onSuccess: (data) => {
        if (data) {
          updateChart(chartId, data)
        }
      },
    },
  )

  const chartConfig = useMemo(() => {
    if (!data) return null

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
        tooltip: {
          enabled: true,
          intersect: false,
        },
      },
      scales:
        data.type !== "pie"
          ? {
              x: {
                display: true,
                grid: {
                  display: false,
                },
              },
              y: {
                display: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
            }
          : undefined,
    }
  }, [data])

  return {
    data,
    config: chartConfig,
    error,
    isLoading,
    refresh: mutate,
  }
}
