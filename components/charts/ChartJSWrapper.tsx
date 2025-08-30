"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line, Bar, Pie, Scatter } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface ChartJSWrapperProps {
  chartType: "line" | "bar" | "pie" | "area" | "scatter"
  data: any[]
  config?: Record<string, any>
  width?: number
  height?: number
  className?: string
}

export default function ChartJSWrapper({
  chartType,
  data,
  config = {},
  height = 300,
  className = "",
}: ChartJSWrapperProps) {
  const transformData = () => {
    const labels = data.map((item) => item.name || item.label)
    const values = data.map((item) => item.value || item.y)

    return {
      labels,
      datasets: [
        {
          label: "Dataset",
          data: values,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 205, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 2,
          fill: chartType === "area",
        },
      ],
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales:
      chartType !== "pie"
        ? {
            y: {
              beginAtZero: true,
            },
          }
        : undefined,
    ...config,
  }

  const chartData = transformData()

  const renderChart = () => {
    switch (chartType) {
      case "line":
      case "area":
        return <Line data={chartData} options={options} />
      case "bar":
        return <Bar data={chartData} options={options} />
      case "pie":
        return <Pie data={chartData} options={options} />
      case "scatter":
        return <Scatter data={chartData} options={options} />
      default:
        return null
    }
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      {renderChart()}
    </div>
  )
}
