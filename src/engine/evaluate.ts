import {
  PAIR_SEATS,
  RANK_ACE,
  RANK_JACK,
  RANK_KING,
  RANK_QUEEN,
  SUITS,
  cardRank,
  cardSuitIndex,
  type Card,
  type Deal,
  type Pair,
  type Suit,
} from './cards'

export type SuitLengths = Record<Suit, number>

export type ShapeClass = 'balanced' | 'semi-balanced' | 'unbalanced'

/** A=4, K=3, Q=2, J=1. */
export function hcp(hand: readonly Card[]): number {
  let total = 0
  for (const card of hand) {
    const rank = cardRank(card)
    if (rank >= RANK_JACK) total += rank - RANK_JACK + 1
  }
  return total
}

/** Tek bir renkteki HP (örn. sağlam renk: AKQ = 9). */
export function suitHcp(hand: readonly Card[], suit: Suit): number {
  const index = SUITS.indexOf(suit)
  return hcp(hand.filter((card) => cardSuitIndex(card) === index))
}

export function suitLengths(hand: readonly Card[]): SuitLengths {
  const counts = [0, 0, 0, 0]
  for (const card of hand) counts[cardSuitIndex(card)]++
  return { S: counts[0], H: counts[1], D: counts[2], C: counts[3] }
}

/** Büyükten küçüğe uzunluklar, örn. [5, 3, 3, 2]. */
export function shapeLengths(hand: readonly Card[]): number[] {
  const lengths = suitLengths(hand)
  return SUITS.map((suit) => lengths[suit]).sort((a, b) => b - a)
}

/** Örn. "5-3-3-2". */
export function shapePattern(hand: readonly Card[]): string {
  return shapeLengths(hand).join('-')
}

/**
 * Dengeli: 4333, 4432, 5332.
 * Yarı dengeli: tekli/renksizlik yok ama dengeli değil (5422, 6322, 7222).
 */
export function shapeClass(hand: readonly Card[]): ShapeClass {
  const [longest, , third, shortest] = shapeLengths(hand)
  if (shortest >= 2) {
    if (longest <= 5 && third >= 3) return 'balanced'
    return 'semi-balanced'
  }
  return 'unbalanced'
}

export function isBalanced(hand: readonly Card[]): boolean {
  return shapeClass(hand) === 'balanced'
}

export function isSemiBalanced(hand: readonly Card[]): boolean {
  return shapeClass(hand) === 'semi-balanced'
}

/** A=2, K=1. */
export function controls(hand: readonly Card[]): number {
  let total = 0
  for (const card of hand) {
    const rank = cardRank(card)
    if (rank === RANK_ACE) total += 2
    else if (rank === RANK_KING) total += 1
  }
  return total
}

const LTC_HONORS = [RANK_ACE, RANK_KING, RANK_QUEEN]

/**
 * Kaybeden löve sayısı: her renkte ilk min(uzunluk, 3) kart için
 * sırasıyla A, K, Q'dan eksik olanlar sayılır (renksiz 0, tekli en çok 1, ikili en çok 2).
 */
export function losingTrickCount(hand: readonly Card[]): number {
  const lengths = [0, 0, 0, 0]
  const held = [0, 0, 0, 0] // her renk için değer bit maskesi
  for (const card of hand) {
    const suit = cardSuitIndex(card)
    lengths[suit]++
    held[suit] |= 1 << cardRank(card)
  }
  let losers = 0
  for (let suit = 0; suit < 4; suit++) {
    const counted = Math.min(lengths[suit], 3)
    for (let i = 0; i < counted; i++) {
      if (!(held[suit] & (1 << LTC_HONORS[i]))) losers++
    }
  }
  return losers
}

export function pairHcp(deal: Deal, pair: Pair): number {
  const [a, b] = PAIR_SEATS[pair]
  return hcp(deal[a]) + hcp(deal[b])
}

export function pairSuitLengths(deal: Deal, pair: Pair): SuitLengths {
  const [a, b] = PAIR_SEATS[pair]
  const la = suitLengths(deal[a])
  const lb = suitLengths(deal[b])
  return { S: la.S + lb.S, H: la.H + lb.H, D: la.D + lb.D, C: la.C + lb.C }
}

/** Verilen renkler arasında ortaklığın en uzun ortak fiti (eşitlikte renk sırasına göre ilki). */
export function longestFit(
  deal: Deal,
  pair: Pair,
  suits: readonly Suit[] = SUITS,
): { suit: Suit; length: number } {
  const lengths = pairSuitLengths(deal, pair)
  let best = { suit: suits[0], length: lengths[suits[0]] }
  for (const suit of suits) {
    if (lengths[suit] > best.length) best = { suit, length: lengths[suit] }
  }
  return best
}
