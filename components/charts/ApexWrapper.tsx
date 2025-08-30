"use client"

import dynamic from "next/dynamic"
import type { ApexOptions } from "apexcharts"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface ApexWrapperProps {
  chartType: "line" | "bar" | "pie" | "area" | "scatter"
  data: any[]
  config?: Record<string, any>
  width?: number
  height?: number
  className?: string
}

export default function ApexWrapper({ chartType, data, config = {}, height = 300, className = "" }: ApexWrapperProps) {
  const transformData = () => {
    switch (chartType) {
      case "pie":
        return {
          series: data.map((item) => item.value),
          options: {
            chart: {
              type: "pie" as const,
            },
            labels: data.map((item) => item.name),
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200,
                  },
                  legend: {
                    position: "bottom",
                  },
                },
              },
            ],
            ...config,
          } as ApexOptions,
        }

      default:
        return {
          series: [
            {
              name: "Series 1",
              data: data.map((item) => item.value),
            },
          ],
          options: {
            chart: {
              type: chartType as any,
              height: height,
              toolbar: {
                show: false,
              },
            },
            xaxis: {
              categories: data.map((item) => item.name),
            },
            stroke: {
              curve: "smooth" as const,
            },
            fill: {
              type: chartType === "area" ? "gradient" : "solid",
            },
            ...config,
          } as ApexOptions,
        }
    }
  }

  const { series, options } = transformData()

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Chart options={options} series={series} type={chartType as any} height={height} />
    </div>
  )
}
