"use client"

import { useState, useEffect, useRef } from "react"
import { Activity, Zap, Clock } from "lucide-react"

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  fps: number
  chartCount: number
}

interface ChartPerformanceMonitorProps {
  enabled?: boolean
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  className?: string
}

export default function ChartPerformanceMonitor({
  enabled = process.env.NODE_ENV === "development",
  position = "top-right",
  className = "",
}: ChartPerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
    chartCount: 0,
  })
  const [isVisible, setIsVisible] = useState(false)
  const frameRef = useRef<number>()
  const lastTimeRef = useRef<number>(performance.now())
  const framesRef = useRef<number[]>([])

  useEffect(() => {
    if (!enabled) return

    const measurePerformance = () => {
      const now = performance.now()
      const delta = now - lastTimeRef.current
      lastTimeRef.current = now

      // Calculate FPS
      framesRef.current.push(now)
      framesRef.current = framesRef.current.filter((time) => now - time < 1000)
      const fps = framesRef.current.length

      // Get memory usage (if available)
      const memory = (performance as any).memory
      const memoryUsage = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0

      // Count chart elements
      const chartCount = document.querySelectorAll('[class*="chart"], [class*="recharts"]').length

      setMetrics({
        renderTime: Math.round(delta * 100) / 100,
        memoryUsage,
        fps,
        chartCount,
      })

      frameRef.current = requestAnimationFrame(measurePerformance)
    }

    frameRef.current = requestAnimationFrame(measurePerformance)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [enabled])

  if (!enabled) return null

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className="bg-black/80 text-white rounded-lg p-2 text-xs font-mono backdrop-blur-sm">
        <div className="flex items-center space-x-2 cursor-pointer">
          <Activity className="h-3 w-3" />
          <span>Performance</span>
        </div>

        {isVisible && (
          <div className="mt-2 space-y-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Render:</span>
              </span>
              <span className={metrics.renderTime > 16 ? "text-red-400" : "text-green-400"}>
                {metrics.renderTime}ms
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>FPS:</span>
              </span>
              <span
                className={metrics.fps < 30 ? "text-red-400" : metrics.fps < 50 ? "text-yellow-400" : "text-green-400"}
              >
                {metrics.fps}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Memory:</span>
              <span className={metrics.memoryUsage > 100 ? "text-red-400" : "text-green-400"}>
                {metrics.memoryUsage}MB
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Charts:</span>
              <span className="text-blue-400">{metrics.chartCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
