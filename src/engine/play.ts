// Çift kukla oyununun oynatılması: löve kazananı, adım adım oyun durumu, en iyi kartlar arasından
// seçim ve "kritik hamle" tespiti. Kartların hangisinin en iyi olduğunu DDS söyler
// (workers/ddPlay.ts); burada DDS'e bağlı olmayan saf mantık var.

import { SEATS, cardRank, cardSuitIndex, pairOf, rotateSeat } from './cards'
import type { Card, Deal, Pair, Seat } from './cards'
import { contractLevel, parseParContract, type DdResult, type Strain } from './dd'

export interface PlayedCard {
  seat: Seat
  card: Card
}

export interface PlayStep extends PlayedCard {
  /** Aynı (en iyi) sonucu veren diğer kartlar. */
  alternatives: Card[]
  /** Yalnızca bu kart en iyi sonucu korur (başka seçenekler varken). */
  critical: boolean
  /** Oynanabilecek tek kart. */
  forced: boolean
}

export interface PlayLine {
  declarer: Seat
  strain: Strain
  steps: PlayStep[]
  declarerTricks: number
}

export interface PlayContract {
  declarer: Seat
  strain: Strain
  level: number
}

/** Bir oyunda oynanan kart sayısı. */
export const PLAY_LENGTH = 52

const TRUMP_SUIT: Record<Strain, number> = { S: 0, H: 1, D: 2, C: 3, N: -1 }

export function openingLeader(declarer: Seat): Seat {
  return rotateSeat(declarer, 1)
}

/** Löveyi kim alır: koz varsa en yüksek koz, yoksa çıkılan renkteki en yüksek kart. */
export function trickWinner(trick: readonly PlayedCard[], strain: Strain): Seat {
  const trump = TRUMP_SUIT[strain]
  const led = cardSuitIndex(trick[0].card)
  const best = trick.reduce((a, b) => {
    const sa = cardSuitIndex(a.card)
    const sb = cardSuitIndex(b.card)
    if (sa === sb) return cardRank(b.card) > cardRank(a.card) ? b : a
    if (sb === trump) return b
    if (sa === trump) return a
    return sb === led ? b : a
  })
  return best.seat
}

/** DDS'in bir oyuncu için verdiği seçenek: eşdeğer kartlar (yüksekten düşüğe) ve skor. */
export interface PlayOption {
  cards: Card[]
  score: number
}

/**
 * En iyi skorlu kartlardan birini seçer. Eşdeğer kartlar aynı sonucu verir; çıkışta dizinin
 * en yükseği, takip ederken en düşüğü oynanır (masadaki alışkanlık gibi).
 */
export function choosePlay(
  options: readonly PlayOption[],
  leading: boolean,
): { card: Card; alternatives: Card[]; critical: boolean; forced: boolean } {
  const best = Math.max(...options.map((o) => o.score))
  const optimal = options.filter((o) => o.score === best)
  const group = optimal[0].cards
  const card = leading ? group[0] : group[group.length - 1]
  const optimalCards = optimal.flatMap((o) => o.cards)
  const legalCount = options.reduce((sum, o) => sum + o.cards.length, 0)
  const forced = legalCount === 1
  return {
    card,
    alternatives: optimalCards.filter((c) => c !== card).sort(byDisplayOrder),
    critical: !forced && optimalCards.length === 1,
    forced,
  }
}

function byDisplayOrder(a: Card, b: Card): number {
  return cardSuitIndex(a) - cardSuitIndex(b) || cardRank(b) - cardRank(a)
}

export interface PlayState {
  /** Ellerde kalan kartlar. */
  hands: Deal
  /** Ortadaki löve: sürmekte olan, ya da yeni tamamlandıysa o lövenin dört kartı. */
  trick: PlayedCard[]
  /** Tamamlanan lövenin kazananı (löve sürüyorsa null). */
  winner: Seat | null
  tricks: Record<Pair, number>
  /** Tamamlanan löve sayısı. */
  completed: number
  /** Sıradaki oyuncu (oyun bittiyse null). */
  toPlay: Seat | null
}

/** Oyunun ilk `count` kartı oynandıktan sonraki durum. */
export function playStateAt(deal: Deal, line: PlayLine, count: number): PlayState {
  const hands: Deal = { N: [...deal.N], E: [...deal.E], S: [...deal.S], W: [...deal.W] }
  const tricks: Record<Pair, number> = { NS: 0, EW: 0 }
  let current: PlayedCard[] = []
  let last: PlayedCard[] = []
  let lastWinner: Seat | null = null
  let leader = openingLeader(line.declarer)

  for (const step of line.steps.slice(0, count)) {
    hands[step.seat] = hands[step.seat].filter((c) => c !== step.card)
    current.push({ seat: step.seat, card: step.card })
    if (current.length === 4) {
      lastWinner = trickWinner(current, line.strain)
      tricks[pairOf(lastWinner)]++
      leader = lastWinner
      last = current
      current = []
    }
  }

  const completed = tricks.NS + tricks.EW
  const showLast = current.length === 0 && completed > 0
  return {
    hands,
    trick: showLast ? last : current,
    winner: showLast ? lastWinner : null,
    tricks,
    completed,
    toPlay: count >= line.steps.length ? null : rotateSeat(leader, current.length),
  }
}

/**
 * Varsayılan oynatılacak kontrat: par kontrat (birden fazla deklare yapabiliyorsa daha çok löve
 * alanı). Par yoksa en çok löve alınan hücre.
 */
export function defaultContract(dd: DdResult): PlayContract | null {
  for (const raw of dd.par.contracts) {
    const c = parseParContract(raw)
    if (!c) continue
    const declarer = c.seats.reduce((a, b) =>
      dd.tricks[b][c.strain] > dd.tricks[a][c.strain] ? b : a,
    )
    return { declarer, strain: c.strain, level: c.result > 0 ? c.level + c.result : c.level }
  }
  let best: { declarer: Seat; strain: Strain; tricks: number } | null = null
  for (const seat of SEATS) {
    for (const strain of ['N', 'S', 'H', 'D', 'C'] as const) {
      const tricks = dd.tricks[seat][strain]
      if (!best || tricks > best.tricks) best = { declarer: seat, strain, tricks }
    }
  }
  return best ? cellContract(best.declarer, best.strain, best.tricks) : null
}

/** Tablodan seçilen hücrenin kontratı: yapılabilecek en yüksek seviye, çıkmıyorsa 1. */
export function cellContract(declarer: Seat, strain: Strain, tricks: number): PlayContract {
  return { declarer, strain, level: contractLevel(tricks) ?? 1 }
}

/** Deklarenin aldığı lövenin kontrata göre sonucu: 0 = tam, + fazla, − eksik. */
export function contractResult(contract: PlayContract, declarerTricks: number): number {
  return declarerTricks - (contract.level + 6)
}
