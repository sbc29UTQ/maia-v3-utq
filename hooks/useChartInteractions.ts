"use client"

import { useState, useCallback, useRef } from "react"

interface ChartInteraction {
  type: "hover" | "click" | "zoom" | "pan" | "select"
  data: any
  timestamp: number
}

interface UseChartInteractionsOptions {
  enableZoom?: boolean
  enablePan?: boolean
  enableSelection?: boolean
  onInteraction?: (interaction: ChartInteraction) => void
}

export function useChartInteractions(options: UseChartInteractionsOptions = {}) {
  const { enableZoom = true, enablePan = true, enableSelection = false, onInteraction } = options

  const [interactions, setInteractions] = useState<ChartInteraction[]>([])
  const [selectedData, setSelectedData] = useState<any[]>([])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const chartRef = useRef<HTMLDivElement>(null)

  const recordInteraction = useCallback(
    (type: ChartInteraction["type"], data: any) => {
      const interaction: ChartInteraction = {
        type,
        data,
        timestamp: Date.now(),
      }

      setInteractions((prev) => [...prev.slice(-99), interaction]) // Keep last 100 interactions
      onInteraction?.(interaction)
    },
    [onInteraction],
  )

  const handleChartHover = useCallback(
    (data: any) => {
      recordInteraction("hover", data)
    },
    [recordInteraction],
  )

  const handleChartClick = useCallback(
    (data: any) => {
      recordInteraction("click", data)

      if (enableSelection) {
        setSelectedData((prev) => {
          const isSelected = prev.some((item) => item.id === data.id)
          if (isSelected) {
            return prev.filter((item) => item.id !== data.id)
          } else {
            return [...prev, data]
          }
        })
      }
    },
    [recordInteraction, enableSelection],
  )

  const handleZoom = useCallback(
    (delta: number, center?: { x: number; y: number }) => {
      if (!enableZoom) return

      const newZoomLevel = Math.max(0.1, Math.min(5, zoomLevel + delta))
      setZoomLevel(newZoomLevel)
      recordInteraction("zoom", { level: newZoomLevel, center })
    },
    [enableZoom, zoomLevel, recordInteraction],
  )

  const handlePan = useCallback(
    (deltaX: number, deltaY: number) => {
      if (!enablePan) return

      const newOffset = {
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY,
      }
      setPanOffset(newOffset)
      recordInteraction("pan", newOffset)
    },
    [enablePan, panOffset, recordInteraction],
  )

  const resetView = useCallback(() => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
    recordInteraction("zoom", { level: 1, center: null })
  }, [recordInteraction])

  const clearSelection = useCallback(() => {
    setSelectedData([])
  }, [])

  const getChartTransform = useCallback(() => {
    return {
      transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
      transformOrigin: "center center",
    }
  }, [zoomLevel, panOffset])

  return {
    chartRef,
    interactions,
    selectedData,
    zoomLevel,
    panOffset,
    handleChartHover,
    handleChartClick,
    handleZoom,
    handlePan,
    resetView,
    clearSelection,
    getChartTransform,
  }
}
