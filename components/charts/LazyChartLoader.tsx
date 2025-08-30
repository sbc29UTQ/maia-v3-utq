"use client"

import { Suspense, lazy, useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

const ChartWrapper = lazy(() => import("./ChartWrapper"))

interface LazyChartLoaderProps {
  type: "recharts" | "chartjs" | "d3" | "apex"
  chartType: "line" | "bar" | "pie" | "area" | "scatter"
  data: any[]
  config?: Record<string, any>
  width?: number
  height?: number
  className?: string
  enableIntersectionObserver?: boolean
  threshold?: number
}

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg animate-pulse border border-gray-200"
      style={{ height }}
    >
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <div className="text-sm text-gray-500">Loading chart...</div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>
      </div>
    </div>
  )
}

export default function LazyChartLoader({
  enableIntersectionObserver = true,
  threshold = 0.1,
  height = 300,
  ...chartProps
}: LazyChartLoaderProps) {
  const [isVisible, setIsVisible] = useState(!enableIntersectionObserver)
  const [shouldLoad, setShouldLoad] = useState(!enableIntersectionObserver)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enableIntersectionObserver || !containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setTimeout(() => setShouldLoad(true), 100)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [enableIntersectionObserver, threshold])

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      {shouldLoad ? (
        <Suspense fallback={<ChartSkeleton height={height} />}>
          <ChartWrapper {...chartProps} height={height} />
        </Suspense>
      ) : (
        <ChartSkeleton height={height} />
      )}
    </div>
  )
}
