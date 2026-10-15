import { useEffect, useRef, useState } from 'react'
import type { Card, Carding, PlayLine, Seat, Strain } from '../engine'
import type { DdsWorkerRequest, DdsWorkerResponse, PlayJob } from '../workers/ddsMessages'

export type DdPlayState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; line: PlayLine }
  | { status: 'error'; message: string }

type Results = Record<string, { line?: PlayLine; error?: string }>

/**
 * Bir kontratın çift kukla oynanışını DDS işçisinde hesaplar. İşçi bileşen açık kaldıkça
 * yaşar; hesaplanan kontratlar saklanır, aynı kontrat ikinci kez istenirse yeniden hesaplanmaz.
 * `lead`: zorunlu ilk çıkış (konu kontratı); `carding`: savunmanın apel anlaşması.
 */
export function useDdPlay(
  pbn: string | null,
  contract: { declarer: Seat; strain: Strain } | null,
  carding: Carding,
  lead?: Card,
): DdPlayState {
  const workerRef = useRef<Worker | null>(null)
  const requestedRef = useRef(new Set<string>())
  const [results, setResults] = useState<Results>({})
  const declarer = contract?.declarer
  const strain = contract?.strain
  const { signals, discards } = carding
  const key =
    pbn && declarer && strain
      ? `${pbn}|${declarer}${strain}|${signals}|${discards}|${lead ?? ''}`
      : null

  useEffect(
    () => () => {
      // İşçi kapanınca bekleyen istekler de düşer; yeniden kurulunca tekrar istenir.
      workerRef.current?.terminate()
      workerRef.current = null
      requestedRef.current.clear()
    },
    [],
  )

  useEffect(() => {
    if (!key || !pbn || !declarer || !strain || requestedRef.current.has(key)) return
    requestedRef.current.add(key)
    const worker = (workerRef.current ??= new Worker(
      new URL('../workers/ddsWorker.ts', import.meta.url),
      { type: 'module' },
    ))
    const job: PlayJob = { pbn, declarer, strain, carding: { signals, discards }, lead }
    worker.addEventListener('message', function onMessage(event: MessageEvent<DdsWorkerResponse>) {
      const message = event.data
      if (message.type === 'result') return
      worker.removeEventListener('message', onMessage)
      setResults((current) => ({
        ...current,
        [key]: message.type === 'play' ? { line: message.line } : { error: message.message },
      }))
    })
    worker.postMessage({ type: 'play', id: 0, job } satisfies DdsWorkerRequest)
  }, [key, pbn, declarer, strain, signals, discards, lead])

  if (!key) return { status: 'idle' }
  const result = results[key]
  if (result?.line) return { status: 'done', line: result.line }
  if (result?.error) return { status: 'error', message: result.error }
  return { status: 'loading' }
}
