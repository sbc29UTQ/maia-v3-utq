export class ChartPerformanceOptimizer {
  private static instance: ChartPerformanceOptimizer
  private renderQueue: Array<() => void> = []
  private isProcessing = false
  private maxConcurrentCharts = 3
  private activeCharts = 0

  static getInstance(): ChartPerformanceOptimizer {
    if (!ChartPerformanceOptimizer.instance) {
      ChartPerformanceOptimizer.instance = new ChartPerformanceOptimizer()
    }
    return ChartPerformanceOptimizer.instance
  }

  queueRender(renderFn: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.renderQueue.push(() => {
        renderFn()
        resolve()
      })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.isProcessing || this.activeCharts >= this.maxConcurrentCharts) {
      return
    }

    this.isProcessing = true

    while (this.renderQueue.length > 0 && this.activeCharts < this.maxConcurrentCharts) {
      const renderFn = this.renderQueue.shift()
      if (renderFn) {
        this.activeCharts++

        // Use requestIdleCallback if available, otherwise use setTimeout
        if ("requestIdleCallback" in window) {
          requestIdleCallback(() => {
            renderFn()
            this.activeCharts--
            this.processQueue()
          })
        } else {
          setTimeout(() => {
            renderFn()
            this.activeCharts--
            this.processQueue()
          }, 0)
        }
      }
    }

    this.isProcessing = false
  }

  optimizeDataForRendering(data: any[], maxPoints = 100): any[] {
    if (data.length <= maxPoints) return data

    // Use sampling for large datasets
    const step = Math.ceil(data.length / maxPoints)
    return data.filter((_, index) => index % step === 0)
  }

  debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  measureRenderTime<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()

    if (process.env.NODE_ENV === "development") {
      console.log(`[Chart Performance] ${name}: ${(end - start).toFixed(2)}ms`)
    }

    return result
  }

  preloadChartLibrary(library: "recharts" | "chartjs" | "d3" | "apex"): Promise<void> {
    return new Promise((resolve) => {
      switch (library) {
        case "recharts":
          import("recharts").then(() => resolve())
          break
        case "chartjs":
          Promise.all([import("chart.js"), import("react-chartjs-2")]).then(() => resolve())
          break
        case "d3":
          import("d3").then(() => resolve())
          break
        case "apex":
          import("react-apexcharts").then(() => resolve())
          break
        default:
          resolve()
      }
    })
  }
}

export const chartOptimizer = ChartPerformanceOptimizer.getInstance()
