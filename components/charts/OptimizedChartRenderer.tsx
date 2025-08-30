"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { chartOptimizer } from "@/lib/chart-performance"
import LazyChartLoader from "./LazyChartLoader"

interface OptimizedChartRendererProps {
  type: "recharts" | "chartjs" | "d3" | "apex"
  chartType: "line" | "bar" | "pie" | "area" | "scatter"
  data: any[]
  config?: Record<string, any>
  width?: number
  height?: number
  className?: string
  maxDataPoints?: number
  enableOptimization?: boolean
}

export default function OptimizedChartRenderer({
  data,
  maxDataPoints = 100,
  enableOptimization = true,
  ...chartProps
}: OptimizedChartRendererProps) {
  const [isReady, setIsReady] = useState(false)
  const [renderError, setRenderError] = useState<string | null>(null)

  const optimizedData = useMemo(() => {
    if (!enableOptimization) return data

    return chartOptimizer.measureRenderTime("Data Optimization", () => {
      return chartOptimizer.optimizeDataForRendering(data, maxDataPoints)
    })
  }, [data, maxDataPoints, enableOptimization])

  const debouncedRender = useCallback(
    chartOptimizer.debounce(() => {
      setIsReady(true)
    }, 100),
    [],
  )

  useEffect(() => {
    setIsReady(false)
    setRenderError(null)

    // Preload chart library
    chartOptimizer
      .preloadChartLibrary(chartProps.type)
      .then(() => {
        debouncedRender()
      })
      .catch((error) => {
        setRenderError(`Failed to load chart library: ${error.message}`)
      })
  }, [chartProps.type, debouncedRender])

  if (renderError) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 font-medium">Chart Render Error</div>
          <div className="text-red-500 text-sm mt-1">{renderError}</div>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg animate-pulse">
        <div className="text-gray-500">Optimizing chart...</div>
      </div>
    )
  }

  return <LazyChartLoader {...chartProps} data={optimizedData} enableIntersectionObserver={enableOptimization} />
}
