// Çift kukla analizi (DDS, WebAssembly): board başına löve tablosu ve par ('solve'),
// bir kontratın kusursuz oynanışı ('play').
// Kullanım: new Worker(new URL('./ddsWorker.ts', import.meta.url), { type: 'module' })

import { Dds, loadDds } from 'bridge-dds'
import { parsePbnDeal, tricksFromDds, type Seat, type Vulnerability } from '../engine'
import { computePlayLine } from './ddPlay'
import type { DdsWorkerRequest, DdsWorkerResponse } from './ddsMessages'

const DDS_DEALER: Record<Seat, number> = { N: 0, E: 1, S: 2, W: 3 }
const DDS_VULNERABLE: Record<Vulnerability, number> = { None: 0, All: 1, NS: 2, EW: 3 }

let ddsPromise: Promise<Dds> | null = null
const getDds = () => (ddsPromise ??= loadDds().then((module) => new Dds(module)))

function post(message: DdsWorkerResponse): void {
  self.postMessage(message)
}

self.addEventListener('message', async (event: MessageEvent<DdsWorkerRequest>) => {
  const request = event.data
  try {
    const dds = await getDds()
    if (request.type === 'play') {
      const { pbn, declarer, strain } = request.job
      post({
        type: 'play',
        id: request.id,
        line: computePlayLine(dds, parsePbnDeal(pbn), declarer, strain),
      })
      return
    }
    const { job } = request
    const table = dds.CalcDDTablePBN({ cards: job.pbn })
    const par = dds.DealerPar(table, DDS_DEALER[job.dealer], DDS_VULNERABLE[job.vul])
    post({
      type: 'result',
      id: request.id,
      result: {
        tricks: tricksFromDds(table.resTable),
        par: { score: par.score, contracts: par.contracts },
      },
    })
  } catch (error) {
    post({
      type: 'error',
      id: request.id,
      message: error instanceof Error ? error.message : String(error),
    })
  }
})
