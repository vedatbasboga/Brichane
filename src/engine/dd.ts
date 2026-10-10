// Çift kukla (double dummy) sonuçlarının modeli. Hesabı DDS yapar (workers/ddsWorker.ts);
// burada yalnızca saf dönüşümler var.

import { SEATS, type Seat } from './cards'

/** Koz: ♣ ♦ ♥ ♠ ve NT. */
export type Strain = 'C' | 'D' | 'H' | 'S' | 'N'

/** Gösterim sırası (planla aynı): ♣ ♦ ♥ ♠ NT. */
export const STRAINS: readonly Strain[] = ['C', 'D', 'H', 'S', 'N']

export const STRAIN_SYMBOLS: Record<Strain, string> = {
  C: '♣',
  D: '♦',
  H: '♥',
  S: '♠',
  N: 'NT',
}

/** Deklare × koz → löve sayısı. */
export type DdTricks = Record<Seat, Record<Strain, number>>

export interface DdPar {
  /** Kuzey-Güney açısından skor (DB lehine negatif). */
  score: number
  /** DDS biçiminde par kontratları, örn. "4S-NS", "3N-E+1", "5D*-EW-3". */
  contracts: string[]
}

export interface DdResult {
  tricks: DdTricks
  par: DdPar
}

// DDS tablosu: resTable[koz][oyuncu], koz sırası ♠ ♥ ♦ ♣ NT, oyuncu sırası K D G B.
const DDS_STRAIN_ORDER: readonly Strain[] = ['S', 'H', 'D', 'C', 'N']

export function tricksFromDds(resTable: readonly (readonly number[])[]): DdTricks {
  const tricks = {} as DdTricks
  SEATS.forEach((seat, hand) => {
    tricks[seat] = {} as Record<Strain, number>
    DDS_STRAIN_ORDER.forEach((strain, s) => {
      tricks[seat][strain] = resTable[s][hand]
    })
  })
  return tricks
}

// PBN "DoubleDummyTricks" (Bridge Composer): her deklare (K D G B) için NT ♠ ♥ ♦ ♣ sırasıyla
// birer onaltılık hane, toplam 20 hane. Firestore'da da bu biçimde saklanır.
const HEX_STRAIN_ORDER: readonly Strain[] = ['N', 'S', 'H', 'D', 'C']

export function tricksToHex(tricks: DdTricks): string {
  return SEATS.map((seat) =>
    HEX_STRAIN_ORDER.map((strain) => tricks[seat][strain].toString(16)).join(''),
  ).join('')
}

export function tricksFromHex(hex: string): DdTricks {
  if (!/^[0-9a-dA-D]{20}$/.test(hex)) throw new Error(`Invalid double dummy string "${hex}"`)
  const tricks = {} as DdTricks
  SEATS.forEach((seat, i) => {
    tricks[seat] = {} as Record<Strain, number>
    HEX_STRAIN_ORDER.forEach((strain, j) => {
      tricks[seat][strain] = parseInt(hex[i * 5 + j], 16)
    })
  })
  return tricks
}

export interface ParContract {
  level: number
  strain: Strain
  doubled: boolean
  /** Kontratı yapabilen oyuncu(lar). */
  seats: Seat[]
  /** Fazla (+) / eksik (−) löve; tam yapılıyorsa 0. */
  result: number
}

const PAR_PATTERN = /^([1-7])([SHDCN])(\*)?-(NS|EW|N|E|S|W)([+-]\d+)?$/

/** "5D*-EW-3" → { level: 5, strain: 'D', doubled: true, seats: ['E','W'], result: -3 }. */
export function parseParContract(raw: string): ParContract | null {
  const match = PAR_PATTERN.exec(raw.trim())
  if (!match) return null
  const [, level, strain, star, side, result] = match
  return {
    level: Number(level),
    strain: strain as Strain,
    doubled: star === '*',
    seats: side.split('') as Seat[],
    result: result ? Number(result) : 0,
  }
}

/** Löveden kontrat seviyesi: 10 löve → 4; 7'den az löve → null (kontrat çıkmaz). */
export function contractLevel(tricks: number): number | null {
  return tricks >= 7 ? tricks - 6 : null
}

/** Par kontratın oynandığı hücreler ("N" + "S" gibi deklare + koz anahtarları). */
export function parCells(par: DdPar): Set<`${Seat}${Strain}`> {
  const cells = new Set<`${Seat}${Strain}`>()
  for (const raw of par.contracts) {
    const contract = parseParContract(raw)
    if (contract) for (const seat of contract.seats) cells.add(`${seat}${contract.strain}`)
  }
  return cells
}
