// Çift kukla analizi (DDS, WebAssembly). Her board için löve tablosu ve par.
// Kullanım: new Worker(new URL('./ddsWorker.ts', import.meta.url), { type: 'module' })

import { Dds, loadDds } from 'bridge-dds'
import { tricksFromDds, type Seat, type Vulnerability } from '../engine'
import type { DdsWorkerRequest, DdsWorkerResponse } from './ddsMessages'

const DDS_DEALER: Record<Seat, number> = { N: 0, E: 1, S: 2, W: 3 }
const DDS_VULNERABLE: Record<Vulnerability, number> = { None: 0, All: 1, NS: 2, EW: 3 }

let ddsPromise: Promise<Dds> | null = null
const getDds = () => (ddsPromise ??= loadDds().then((module) => new Dds(module)))

function post(message: DdsWorkerResponse): void {
  self.postMessage(message)
}

self.addEventListener('message', async (event: MessageEvent<DdsWorkerRequest>) => {
  const { id, job } = event.data
  try {
    const dds = await getDds()
    const table = dds.CalcDDTablePBN({ cards: job.pbn })
    const par = dds.DealerPar(table, DDS_DEALER[job.dealer], DDS_VULNERABLE[job.vul])
    post({
      type: 'result',
      id,
      result: {
        tricks: tricksFromDds(table.resTable),
        par: { score: par.score, contracts: par.contracts },
      },
    })
  } catch (error) {
    post({ type: 'error', id, message: error instanceof Error ? error.message : String(error) })
  }
})
