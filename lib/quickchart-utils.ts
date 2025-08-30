export interface QuickChartConfig {
  type: "bar" | "line" | "pie" | "doughnut" | "radar" | "scatter"
  data: {
    labels?: string[]
    datasets: Array<{
      label?: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string | string[]
      borderWidth?: number
    }>
  }
  options?: {
    responsive?: boolean
    plugins?: {
      title?: {
        display: boolean
        text: string
      }
      legend?: {
        display: boolean
        position?: "top" | "bottom" | "left" | "right"
      }
    }
    scales?: any
  }
}

export const generateQuickChartUrl = (config: QuickChartConfig, width = 500, height = 300): string => {
  const baseUrl = "https://quickchart.io/chart"
  const chartConfig = encodeURIComponent(JSON.stringify(config))

  return `${baseUrl}?c=${chartConfig}&w=${width}&h=${height}&f=png&bkg=white`
}

export const createChartConfig = (
  type: QuickChartConfig["type"],
  data: Array<{ label: string; value: number; color?: string }>,
  title?: string,
): QuickChartConfig => {
  const labels = data.map((item) => item.label)
  const values = data.map((item) => item.value)
  const colors = data.map((item) => item.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`)

  const config: QuickChartConfig = {
    type,
    data: {
      labels,
      datasets: [
        {
          label: title || "Dataset",
          data: values,
          backgroundColor: type === "pie" || type === "doughnut" ? colors : colors[0],
          borderColor: type === "line" ? colors[0] : undefined,
          borderWidth: type === "line" ? 2 : 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: !!title,
          text: title || "",
        },
        legend: {
          display: true,
          position: "top",
        },
      },
    },
  }

  return config
}
