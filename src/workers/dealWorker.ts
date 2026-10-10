// El üretimini arayüzü kilitlemeden çalıştırır.
// Kullanım: new Worker(new URL('./dealWorker.ts', import.meta.url), { type: 'module' })

import { generateDeals } from '../engine'
import type { DealWorkerRequest, DealWorkerResponse } from './dealMessages'

function post(message: DealWorkerResponse): void {
  self.postMessage(message)
}

self.addEventListener('message', (event: MessageEvent<DealWorkerRequest>) => {
  const request = event.data
  if (request.type !== 'generate') return
  try {
    const result = generateDeals(request.options, (progress) =>
      post({ type: 'progress', progress }),
    )
    post({ type: 'done', result })
  } catch (error) {
    post({ type: 'error', message: error instanceof Error ? error.message : String(error) })
  }
})
