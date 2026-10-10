import type { GenerateOptions, GenerateProgress, GenerateResult } from '../engine'

export type DealWorkerRequest = { type: 'generate'; options: GenerateOptions }

export type DealWorkerResponse =
  | { type: 'progress'; progress: GenerateProgress }
  | { type: 'done'; result: GenerateResult }
  | { type: 'error'; message: string }
