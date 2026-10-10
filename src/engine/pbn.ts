// PBN el ve dağıtım metinleri. Örn. el: "AKQ2.KJ3.T98.765" (♠.♥.♦.♣).
// Dağıtım: "N:<N eli> <E eli> <S eli> <W eli>" — ilk koltuktan saat yönünde.

import {
  RANK_CHARS,
  SEATS,
  SUITS,
  handBySuit,
  makeCard,
  rotateSeat,
  sortHand,
  type Card,
  type Deal,
  type Hand,
  type Seat,
} from './cards'

export function handToPbn(hand: readonly Card[]): string {
  const bySuit = handBySuit(hand)
  return SUITS.map((suit) => bySuit[suit].map((rank) => RANK_CHARS[rank]).join('')).join('.')
}

export function parsePbnHand(text: string): Hand {
  const parts = text.trim().split('.')
  if (parts.length !== 4) throw new Error(`Invalid PBN hand "${text}"`)
  const cards: Card[] = []
  parts.forEach((ranks, suitIndex) => {
    for (const ch of ranks.toUpperCase()) {
      const rank = RANK_CHARS.indexOf(ch)
      if (rank < 0) throw new Error(`Invalid rank "${ch}" in PBN hand "${text}"`)
      cards.push(makeCard(SUITS[suitIndex], rank))
    }
  })
  if (new Set(cards).size !== cards.length) throw new Error(`Duplicate card in PBN hand "${text}"`)
  return sortHand(cards)
}

export function dealToPbn(deal: Deal, first: Seat = 'N'): string {
  const hands = [0, 1, 2, 3].map((i) => handToPbn(deal[rotateSeat(first, i)]))
  return `${first}:${hands.join(' ')}`
}

/** Tam (52 kartlık) dağıtım metnini okur. */
export function parsePbnDeal(text: string): Deal {
  const match = /^\s*([NESW]):(.+)$/i.exec(text)
  if (!match) throw new Error(`Invalid PBN deal "${text}"`)
  const first = match[1].toUpperCase() as Seat
  const handTexts = match[2].trim().split(/\s+/)
  if (handTexts.length !== 4) throw new Error(`PBN deal must have 4 hands: "${text}"`)
  const deal = {} as Deal
  handTexts.forEach((handText, i) => {
    const hand = parsePbnHand(handText)
    if (hand.length !== 13) throw new Error(`Hand must have 13 cards: "${handText}"`)
    deal[rotateSeat(first, i)] = hand
  })
  const all = SEATS.flatMap((seat) => deal[seat])
  if (new Set(all).size !== 52) throw new Error(`PBN deal has duplicate cards: "${text}"`)
  return deal
}
