import { SEATS, type Seat } from './cards'

/** PBN `Vulnerable` değerleri. */
export type Vulnerability = 'None' | 'NS' | 'EW' | 'All'

// Standart 16'lık zon döngüsü, indeks = (board - 1) % 16.
// prettier-ignore
const VULNERABILITY_CYCLE: readonly Vulnerability[] = [
  'None', 'NS', 'EW', 'All',
  'NS', 'EW', 'All', 'None',
  'EW', 'All', 'None', 'NS',
  'All', 'None', 'NS', 'EW',
]

function assertBoard(board: number): void {
  if (!Number.isInteger(board) || board < 1) throw new RangeError(`Invalid board number ${board}`)
}

/** Board 1 = N, 2 = E, 3 = S, 4 = W, sonra tekrar. */
export function boardDealer(board: number): Seat {
  assertBoard(board)
  return SEATS[(board - 1) % 4]
}

export function boardVulnerability(board: number): Vulnerability {
  assertBoard(board)
  return VULNERABILITY_CYCLE[(board - 1) % 16]
}

export function isVulnerable(vul: Vulnerability, seat: Seat): boolean {
  if (vul === 'All') return true
  if (vul === 'None') return false
  return vul.includes(seat)
}
