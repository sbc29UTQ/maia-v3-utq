"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import useSWR from "swr"
import { useChartStore } from "@/lib/chart-store"

interface ChartDataPoint {
  name: string
  value: number
  category?: string
  timestamp?: number
}

interface UseChartDataOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableCache?: boolean
  transformData?: (data: any[]) => ChartDataPoint[]
  filterFn?: (data: ChartDataPoint[]) => ChartDataPoint[]
}

export function useChartData(dataSource: string | (() => Promise<any[]>), options: UseChartDataOptions = {}) {
  const { autoRefresh = false, refreshInterval = 30000, enableCache = true, transformData, filterFn } = options

  const { addChart, getChart } = useChartStore()
  const [localData, setLocalData] = useState<ChartDataPoint[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const fetcher = useCallback(async (source: string | (() => Promise<any[]>)) => {
    if (typeof source === "string") {
      const response = await fetch(source)
      if (!response.ok) throw new Error("Failed to fetch data")
      return response.json()
    } else {
      return source()
    }
  }, [])

  const { data, error, isLoading, mutate } = useSWR(
    typeof dataSource === "string" ? dataSource : "custom-data-source",
    () => fetcher(dataSource),
    {
      refreshInterval: autoRefresh ? refreshInterval : 0,
      revalidateOnFocus: false,
      dedupingInterval: enableCache ? 60000 : 0,
    },
  )

  const processedData = useMemo(() => {
    if (!data) return []

    setIsProcessing(true)

    let processed = data

    // Apply transformation if provided
    if (transformData) {
      processed = transformData(processed)
    } else {
      // Default transformation
      processed = data.map((item: any, index: number) => ({
        name: item.name || item.label || `Item ${index + 1}`,
        value: typeof item.value === "number" ? item.value : item.y || item.count || 0,
        category: item.category || "default",
        timestamp: item.timestamp || Date.now(),
      }))
    }

    // Apply filter if provided
    if (filterFn) {
      processed = filterFn(processed)
    }

    setIsProcessing(false)
    return processed
  }, [data, transformData, filterFn])

  useEffect(() => {
    if (processedData.length > 0) {
      setLocalData(processedData)
    }
  }, [processedData])

  const addDataPoint = useCallback((point: ChartDataPoint) => {
    setLocalData((prev) => [...prev, point])
  }, [])

  const removeDataPoint = useCallback((index: number) => {
    setLocalData((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateDataPoint = useCallback((index: number, updates: Partial<ChartDataPoint>) => {
    setLocalData((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)))
  }, [])

  const clearData = useCallback(() => {
    setLocalData([])
  }, [])

  return {
    data: localData,
    rawData: data,
    error,
    isLoading,
    isProcessing,
    refresh: mutate,
    addDataPoint,
    removeDataPoint,
    updateDataPoint,
    clearData,
  }
}
