import {
  PAIR_SEATS,
  PAIRS,
  SEATS,
  SUITS,
  type Card,
  type Deal,
  type Pair,
  type Seat,
  type Suit,
} from './cards'
import {
  controls,
  hcp,
  losingTrickCount,
  pairHcp,
  pairSuitLengths,
  shapeClass,
  suitLengths,
  type ShapeClass,
} from './evaluate'

/** Kapalı aralık [min, max]. */
export type Range = readonly [number, number]

export type ShapeConstraint = 'any' | ShapeClass | readonly ShapeClass[]

/** Verilen renklerden en az birinin uzunluğu aralıkta olmalı (örn. "5+ ♥ veya ♠"). */
export interface AnySuitConstraint {
  suits: readonly Suit[]
  length: Range
}

export interface SeatConstraint {
  hcp?: Range
  shape?: ShapeConstraint
  suits?: Partial<Record<Suit, Range>>
  anySuit?: AnySuitConstraint
  controls?: Range
  ltc?: Range
  /** Konu rengindeki uzunluk (tarifte `topicSuit` seçiliyse). */
  topicSuit?: Range
  /** Konu rengi bu elin açacağı renk olmalı: en uzun renk, eşitlikte yüksek renk. */
  topicSuitLongest?: boolean
  /** El bunlardan hiçbirine uymamalı (örn. minör açılış: "1NT eli değil"). */
  exclude?: readonly SeatConstraint[]
}

/** Ortaklığın verilen renklerden (varsayılan: hepsi) en az birinde ortak uzunluğu aralıkta olmalı. */
export interface FitConstraint {
  suits?: readonly Suit[]
  length: Range
}

export interface PairConstraint {
  hcp?: Range
  fit?: FitConstraint
}

/**
 * Konu elinin koltuğa yerleşimi:
 * - `balanced` (varsayılan): dağıtım, tarifteki dağıtıcı board'un standart dağıtıcısına
 *   gelecek şekilde çevrilir; konu eli dört koltuğa eşit dağılır, dağıtıcı/zon standart kalır.
 * - `fixed`: eller tarifte yazılan koltuklarda kalır (örn. hep Güney açar).
 */
export type Placement = 'balanced' | 'fixed'

export interface Recipe {
  id: string
  name: string
  category: string
  description?: string
  /** Tarifin hangi koltuktan yazıldığı; `fixed` yerleşimde dağıtıcı budur. */
  dealer?: Seat
  seats: Partial<Record<Seat, SeatConstraint>>
  pair?: Partial<Record<Pair, PairConstraint>>
  placement?: Placement
  /**
   * Konu rengi: bu renklerden biri seçilir ve koltukların `topicSuit` koşulları aynı renge
   * uygulanır (örn. rakip bir renkte 5+ açar, kontr eden o renkte kısa).
   */
  topicSuit?: { suits: readonly Suit[] }
}

export function inRange(value: number, [min, max]: Range): boolean {
  return value >= min && value <= max
}

export function matchesShape(cls: ShapeClass, shape: ShapeConstraint): boolean {
  if (shape === 'any') return true
  if (typeof shape === 'string') return cls === shape
  return shape.includes(cls)
}

export function matchesSeat(hand: readonly Card[], c: SeatConstraint, topicSuit?: Suit): boolean {
  if (c.hcp && !inRange(hcp(hand), c.hcp)) return false
  const topicRange = topicSuit ? c.topicSuit : undefined
  if (c.suits || c.anySuit || topicRange) {
    const lengths = suitLengths(hand)
    if (c.suits) {
      for (const suit of Object.keys(c.suits) as Suit[]) {
        const range = c.suits[suit]
        if (range && !inRange(lengths[suit], range)) return false
      }
    }
    if (c.anySuit) {
      const { suits, length } = c.anySuit
      if (!suits.some((suit) => inRange(lengths[suit], length))) return false
    }
    if (topicSuit && topicRange && !inRange(lengths[topicSuit], topicRange)) return false
  }
  if (c.topicSuitLongest && topicSuit && !isOpeningSuit(suitLengths(hand), topicSuit)) return false
  if (c.shape && !matchesShape(shapeClass(hand), c.shape)) return false
  if (c.controls && !inRange(controls(hand), c.controls)) return false
  if (c.ltc && !inRange(losingTrickCount(hand), c.ltc)) return false
  if (c.exclude?.some((excluded) => matchesSeat(hand, excluded, topicSuit))) return false
  return true
}

/** En uzun renk mi (eşit uzunlukta daha yüksek renk yoksa)? Renk sırası ♠ ♥ ♦ ♣. */
export function isOpeningSuit(lengths: Record<Suit, number>, suit: Suit): boolean {
  const rank = SUITS.indexOf(suit)
  return SUITS.every((other, i) =>
    i < rank ? lengths[other] < lengths[suit] : lengths[other] <= lengths[suit],
  )
}

export function matchesPair(deal: Deal, pair: Pair, c: PairConstraint): boolean {
  if (c.hcp && !inRange(pairHcp(deal, pair), c.hcp)) return false
  if (c.fit) {
    const lengths = pairSuitLengths(deal, pair)
    const suits = c.fit.suits ?? (Object.keys(lengths) as Suit[])
    const range = c.fit.length
    if (!suits.some((suit) => inRange(lengths[suit], range))) return false
  }
  return true
}

function matchesSeats(deal: Deal, recipe: Recipe, topicSuit?: Suit): boolean {
  for (const seat of SEATS) {
    const c = recipe.seats[seat]
    if (c && !matchesSeat(deal[seat], c, topicSuit)) return false
  }
  return true
}

export function matchesRecipe(deal: Deal, recipe: Recipe): boolean {
  if (recipe.pair) {
    for (const pair of PAIRS) {
      const c = recipe.pair[pair]
      if (c && !matchesPair(deal, pair, c)) return false
    }
  }
  const topicSuits = recipe.topicSuit?.suits
  if (!topicSuits?.length) return matchesSeats(deal, recipe)
  return topicSuits.some((suit) => matchesSeats(deal, recipe, suit))
}

/** Tarifin koşul koyduğu koltuklar ("konu eli"), N E S W sırasıyla. */
export function focusSeats(recipe: Recipe): Seat[] {
  const seats = new Set<Seat>()
  for (const seat of SEATS) if (recipe.seats[seat]) seats.add(seat)
  for (const pair of PAIRS) {
    if (recipe.pair?.[pair]) for (const seat of PAIR_SEATS[pair]) seats.add(seat)
  }
  return SEATS.filter((seat) => seats.has(seat))
}
