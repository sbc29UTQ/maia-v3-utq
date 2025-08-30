"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

const RechartsWrapper = dynamic(() => import("./RechartsWrapper"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

const ChartJSWrapper = dynamic(() => import("./ChartJSWrapper"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

const D3Wrapper = dynamic(() => import("./D3Wrapper"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

const ApexWrapper = dynamic(() => import("./ApexWrapper"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

interface ChartWrapperProps {
  type: "recharts" | "chartjs" | "d3" | "apex"
  chartType: "line" | "bar" | "pie" | "area" | "scatter"
  data: any[]
  config?: Record<string, any>
  width?: number
  height?: number
  className?: string
}

function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )
}

export default function ChartWrapper({
  type,
  chartType,
  data,
  config = {},
  width,
  height = 300,
  className = "",
}: ChartWrapperProps) {
  const commonProps = {
    chartType,
    data,
    config,
    width,
    height,
    className,
  }

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <div className={`chart-container ${className}`} style={{ height }}>
        {type === "recharts" && <RechartsWrapper {...commonProps} />}
        {type === "chartjs" && <ChartJSWrapper {...commonProps} />}
        {type === "d3" && <D3Wrapper {...commonProps} />}
        {type === "apex" && <ApexWrapper {...commonProps} />}
      </div>
    </Suspense>
  )
}
