import { useCallback, useEffect, useRef, useState } from 'react'
import type { GenerateOptions, GenerateProgress, GenerateResult } from '../engine'
import type { DealWorkerRequest, DealWorkerResponse } from '../workers/dealMessages'

export type GeneratorState =
  | { status: 'idle' }
  | { status: 'running'; progress: GenerateProgress | null }
  | { status: 'done'; result: GenerateResult }
  | { status: 'error'; message: string }

/** El üretimini Web Worker'da çalıştırır; yeni üretim başlayınca öncekini durdurur. */
export function useDealGenerator() {
  const [state, setState] = useState<GeneratorState>({ status: 'idle' })
  const workerRef = useRef<Worker | null>(null)

  const stopWorker = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
  }, [])

  useEffect(() => stopWorker, [stopWorker])

  const generate = useCallback(
    (options: GenerateOptions) => {
      stopWorker()
      const worker = new Worker(new URL('../workers/dealWorker.ts', import.meta.url), {
        type: 'module',
      })
      workerRef.current = worker
      setState({ status: 'running', progress: null })

      worker.onmessage = (event: MessageEvent<DealWorkerResponse>) => {
        const message = event.data
        if (message.type === 'progress') {
          setState({ status: 'running', progress: message.progress })
          return
        }
        setState(
          message.type === 'done'
            ? { status: 'done', result: message.result }
            : { status: 'error', message: message.message },
        )
        stopWorker()
      }
      worker.onerror = (event) => {
        setState({ status: 'error', message: event.message })
        stopWorker()
      }
      worker.postMessage({ type: 'generate', options } satisfies DealWorkerRequest)
    },
    [stopWorker],
  )

  const cancel = useCallback(() => {
    stopWorker()
    setState({ status: 'idle' })
  }, [stopWorker])

  return { state, generate, cancel }
}
