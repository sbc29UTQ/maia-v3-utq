import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ChartData {
  id: string
  type: "line" | "bar" | "pie" | "area" | "scatter"
  data: any[]
  config: Record<string, any>
  lastUpdated: number
}

interface ChartStore {
  charts: Record<string, ChartData>
  addChart: (chart: ChartData) => void
  updateChart: (id: string, updates: Partial<ChartData>) => void
  removeChart: (id: string) => void
  getChart: (id: string) => ChartData | undefined
}

export const useChartStore = create<ChartStore>()(
  persist(
    (set, get) => ({
      charts: {},
      addChart: (chart) =>
        set((state) => ({
          charts: { ...state.charts, [chart.id]: chart },
        })),
      updateChart: (id, updates) =>
        set((state) => ({
          charts: {
            ...state.charts,
            [id]: { ...state.charts[id], ...updates, lastUpdated: Date.now() },
          },
        })),
      removeChart: (id) =>
        set((state) => {
          const { [id]: removed, ...rest } = state.charts
          return { charts: rest }
        }),
      getChart: (id) => get().charts[id],
    }),
    {
      name: "chart-storage",
      partialize: (state) => ({ charts: state.charts }),
    },
  ),
)
