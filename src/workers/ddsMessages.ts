import type { DdResult, Seat, Vulnerability } from '../engine'

export interface DdJob {
  /** Kuzeyden başlayan PBN dağıtım metni. */
  pbn: string
  dealer: Seat
  vul: Vulnerability
}

export type DdsWorkerRequest = { type: 'solve'; id: number; job: DdJob }

export type DdsWorkerResponse =
  { type: 'result'; id: number; result: DdResult } | { type: 'error'; id: number; message: string }
