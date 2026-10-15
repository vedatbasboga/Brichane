import type { Card, Carding, DdResult, PlayLine, Seat, Strain, Vulnerability } from '../engine'

export interface DdJob {
  /** Kuzeyden başlayan PBN dağıtım metni. */
  pbn: string
  dealer: Seat
  vul: Vulnerability
}

export interface PlayJob {
  /** Kuzeyden başlayan PBN dağıtım metni. */
  pbn: string
  declarer: Seat
  strain: Strain
  carding: Carding
  /** Zorunlu ilk çıkış (konu kontratı). */
  lead?: Card
}

export type DdsWorkerRequest =
  { type: 'solve'; id: number; job: DdJob } | { type: 'play'; id: number; job: PlayJob }

export type DdsWorkerResponse =
  | { type: 'result'; id: number; result: DdResult }
  | { type: 'play'; id: number; line: PlayLine }
  | { type: 'error'; id: number; message: string }
