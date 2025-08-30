"use client"

import type React from "react"

import { useState, useRef, useMemo } from "react"
import { FixedSizeList as List } from "react-window"
import LazyChartLoader from "./LazyChartLoader"

interface ChartItem {
  id: string
  type: "recharts" | "chartjs" | "d3" | "apex"
  chartType: "line" | "bar" | "pie" | "area" | "scatter"
  data: any[]
  config?: Record<string, any>
  height?: number
}

interface VirtualizedChartContainerProps {
  charts: ChartItem[]
  containerHeight?: number
  itemHeight?: number
  overscan?: number
  className?: string
}

interface ChartRowProps {
  index: number
  style: React.CSSProperties
  data: ChartItem[]
}

function ChartRow({ index, style, data }: ChartRowProps) {
  const chart = data[index]

  return (
    <div style={style} className="p-2">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <LazyChartLoader
          key={chart.id}
          type={chart.type}
          chartType={chart.chartType}
          data={chart.data}
          config={chart.config}
          height={chart.height || 300}
          enableIntersectionObserver={true}
          threshold={0.1}
        />
      </div>
    </div>
  )
}

export default function VirtualizedChartContainer({
  charts,
  containerHeight = 600,
  itemHeight = 350,
  overscan = 2,
  className = "",
}: VirtualizedChartContainerProps) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 })
  const listRef = useRef<List>(null)

  const memoizedCharts = useMemo(() => charts, [charts])

  const handleItemsRendered = ({ visibleStartIndex, visibleStopIndex }: any) => {
    setVisibleRange({ start: visibleStartIndex, end: visibleStopIndex })
  }

  if (!charts.length) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No charts to display</div>
  }

  return (
    <div className={`w-full ${className}`} style={{ height: containerHeight }}>
      <List
        ref={listRef}
        height={containerHeight}
        itemCount={charts.length}
        itemSize={itemHeight}
        itemData={memoizedCharts}
        overscanCount={overscan}
        onItemsRendered={handleItemsRendered}
      >
        {ChartRow}
      </List>

      <div className="text-xs text-gray-400 mt-2 px-2">
        Showing {visibleRange.start + 1}-{Math.min(visibleRange.end + 1, charts.length)} of {charts.length} charts
      </div>
    </div>
  )
}
