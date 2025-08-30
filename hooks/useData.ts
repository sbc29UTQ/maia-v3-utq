"use client"

import { useState, useEffect, useCallback } from "react"

interface UseDataOptions {
  enableWorker?: boolean
  chunkSize?: number
  processInBackground?: boolean
}

export function useData<T = any>(initialData: T[] = [], processor?: (data: T[]) => T[], options: UseDataOptions = {}) {
  const [data, setData] = useState<T[]>(initialData)
  const [processedData, setProcessedData] = useState<T[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const processData = useCallback(
    async (rawData: T[]) => {
      if (!processor) {
        setProcessedData(rawData)
        return
      }

      setIsProcessing(true)
      setError(null)

      try {
        if (options.enableWorker && rawData.length > (options.chunkSize || 1000)) {
          const worker = new Worker(new URL("../workers/data-processor.worker.ts", import.meta.url))

          worker.postMessage({ data: rawData, processor: processor.toString() })

          worker.onmessage = (e) => {
            setProcessedData(e.data.result)
            setIsProcessing(false)
            worker.terminate()
          }

          worker.onerror = (e) => {
            setError(new Error(`Worker error: ${e.message}`))
            setIsProcessing(false)
            worker.terminate()
          }
        } else {
          const result = processor(rawData)
          setProcessedData(result)
          setIsProcessing(false)
        }
      } catch (err) {
        setError(err as Error)
        setIsProcessing(false)
      }
    },
    [processor, options.enableWorker, options.chunkSize],
  )

  useEffect(() => {
    if (data.length > 0) {
      processData(data)
    }
  }, [data, processData])

  const updateData = useCallback((newData: T[]) => {
    setData(newData)
  }, [])

  const appendData = useCallback((additionalData: T[]) => {
    setData((prev) => [...prev, ...additionalData])
  }, [])

  return {
    data: processedData,
    rawData: data,
    isProcessing,
    error,
    updateData,
    appendData,
    refresh: () => processData(data),
  }
}
