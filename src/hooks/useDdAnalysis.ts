import { useEffect, useState } from 'react'
import type { DdResult } from '../engine'
import type { DdJob, DdsWorkerRequest, DdsWorkerResponse } from '../workers/ddsMessages'

/** Aynı anda en fazla bu kadar işçi (her biri ayrı DDS örneği). */
const MAX_WORKERS = 3

interface AnalysisState {
  jobs: readonly DdJob[] | null
  results: (DdResult | undefined)[]
  error: string | null
}

export interface DdAnalysis {
  /** Board sırasıyla; henüz hesaplanmayanlar `undefined`. */
  results: (DdResult | undefined)[]
  done: number
  total: number
  error: string | null
}

/**
 * Board'ları birkaç Web Worker'a dağıtarak çift kukla analizi yapar.
 * `jobs` dizisinin kimliği değişince baştan başlar (çağıran useMemo ile sabitlemeli).
 * `known`: önceden hesaplanmış sonuçlar (örn. kayıtlı setten); bunlar yeniden hesaplanmaz.
 */
export function useDdAnalysis(
  jobs: readonly DdJob[] | null,
  known?: readonly (DdResult | undefined)[],
): DdAnalysis {
  const [state, setState] = useState<AnalysisState>({ jobs: null, results: [], error: null })

  useEffect(() => {
    if (!jobs) return
    const pending = jobs.map((_, i) => i).filter((i) => !known?.[i])
    if (pending.length === 0) return

    const size = Math.max(
      1,
      Math.min(MAX_WORKERS, (navigator.hardwareConcurrency || 2) - 1, pending.length),
    )
    const workers = Array.from(
      { length: size },
      () => new Worker(new URL('../workers/ddsWorker.ts', import.meta.url), { type: 'module' }),
    )
    let cursor = 0

    const update = (index: number, result: DdResult | undefined, error: string | null) =>
      setState((current) => {
        const results = current.jobs === jobs ? [...current.results] : []
        if (result) results[index] = result
        return { jobs, results, error: error ?? (current.jobs === jobs ? current.error : null) }
      })

    const dispatch = (worker: Worker) => {
      if (cursor >= pending.length) return
      const id = pending[cursor++]
      worker.postMessage({ type: 'solve', id, job: jobs[id] } satisfies DdsWorkerRequest)
    }

    for (const worker of workers) {
      worker.onmessage = (event: MessageEvent<DdsWorkerResponse>) => {
        const message = event.data
        if (message.type === 'result') update(message.id, message.result, null)
        else if (message.type === 'error') update(message.id, undefined, message.message)
        dispatch(worker)
      }
      worker.onerror = (event) => update(-1, undefined, event.message || 'DDS')
      dispatch(worker)
    }

    return () => workers.forEach((worker) => worker.terminate())
  }, [jobs, known])

  const computed = state.jobs === jobs ? state.results : []
  const results = (jobs ?? []).map((_, i) => known?.[i] ?? computed[i])
  return {
    results,
    done: results.filter(Boolean).length,
    total: jobs?.length ?? 0,
    error: state.jobs === jobs ? state.error : null,
  }
}
