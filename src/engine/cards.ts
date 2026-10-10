// Kart modeli: 0–51 arası sayı = renk × 13 + değer.
// Renk sırası ♠ ♥ ♦ ♣ (0–3), değer 0 = 2 … 12 = A.

export const SUITS = ['S', 'H', 'D', 'C'] as const
export type Suit = (typeof SUITS)[number]

export const SEATS = ['N', 'E', 'S', 'W'] as const
export type Seat = (typeof SEATS)[number]

export const PAIRS = ['NS', 'EW'] as const
export type Pair = (typeof PAIRS)[number]

export type Card = number
export type Hand = Card[]
export type Deal = Record<Seat, Hand>

export const SUIT_SYMBOLS: Record<Suit, string> = { S: '♠', H: '♥', D: '♦', C: '♣' }

/** PBN değer karakterleri, indeks = değer. */
export const RANK_CHARS = '23456789TJQKA'

export const RANK_TEN = 8
export const RANK_JACK = 9
export const RANK_QUEEN = 10
export const RANK_KING = 11
export const RANK_ACE = 12

export const PAIR_SEATS: Record<Pair, readonly [Seat, Seat]> = { NS: ['N', 'S'], EW: ['E', 'W'] }

export function makeCard(suit: Suit, rank: number): Card {
  return SUITS.indexOf(suit) * 13 + rank
}

export function cardSuitIndex(card: Card): number {
  return Math.floor(card / 13)
}

export function cardSuit(card: Card): Suit {
  return SUITS[cardSuitIndex(card)]
}

export function cardRank(card: Card): number {
  return card % 13
}

/** Gösterim için değer etiketi: onlu "10" olarak yazılır. */
export function rankLabel(rank: number): string {
  return rank === RANK_TEN ? '10' : RANK_CHARS[rank]
}

/** Örn. "♠A", "♥10". */
export function cardToString(card: Card): string {
  return SUIT_SYMBOLS[cardSuit(card)] + rankLabel(cardRank(card))
}

/** Renklere göre (♠ ♥ ♦ ♣), her renkte büyükten küçüğe sıralı yeni dizi. */
export function sortHand(hand: readonly Card[]): Hand {
  return [...hand].sort((a, b) => cardSuitIndex(a) - cardSuitIndex(b) || cardRank(b) - cardRank(a))
}

export function sortDeal(deal: Deal): Deal {
  return { N: sortHand(deal.N), E: sortHand(deal.E), S: sortHand(deal.S), W: sortHand(deal.W) }
}

/** Her renkteki değerler, büyükten küçüğe. */
export function handBySuit(hand: readonly Card[]): Record<Suit, number[]> {
  const result: Record<Suit, number[]> = { S: [], H: [], D: [], C: [] }
  for (const card of hand) result[cardSuit(card)].push(cardRank(card))
  for (const suit of SUITS) result[suit].sort((a, b) => b - a)
  return result
}

/** Örn. "♠AK2 ♥QJ3 ♦1098 ♣—". */
export function formatHand(hand: readonly Card[]): string {
  const bySuit = handBySuit(hand)
  return SUITS.map(
    (suit) => SUIT_SYMBOLS[suit] + (bySuit[suit].map(rankLabel).join('') || '—'),
  ).join(' ')
}

export function partnerOf(seat: Seat): Seat {
  return rotateSeat(seat, 2)
}

export function pairOf(seat: Seat): Pair {
  return seat === 'N' || seat === 'S' ? 'NS' : 'EW'
}

/** Saat yönünde `steps` koltuk ilerletir. */
export function rotateSeat(seat: Seat, steps: number): Seat {
  return SEATS[(((SEATS.indexOf(seat) + steps) % 4) + 4) % 4]
}
