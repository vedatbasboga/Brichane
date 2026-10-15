// Savunma apelleri (hocanın "Apeller" notu). Çift kukla oyununda savunmacı, aynı sonucu veren
// kartlar arasından anlaşmaya uygun olanı oynar; kartın ne anlattığı da adımla birlikte döner.
// Kurallar yalnızca kart seçer, oyun planını değiştirmez: istenen kart löveye mal olacaksa
// çift kuklanın kartı oynanır ve apel "verilemedi" diye işaretlenir.

import {
  RANK_ACE,
  RANK_QUEEN,
  RANK_TEN,
  SUITS,
  cardRank,
  cardSuit,
  partnerOf,
  type Card,
  type Deal,
  type Hand,
  type Seat,
  type Suit,
} from './cards'
import type { Strain } from './dd'
import { suitHcp } from './evaluate'
import { trickWinner, type PlayedCard } from './play'

/** Tutum ve sayı apelleri: standart (büyük = beğeniyorum / çift) ya da UDCA (tersi). */
export type SignalMethod = 'standard' | 'udca'
/** Defos anlaşması. */
export type DiscardMethod = 'roman' | 'lavinthal'

export interface Carding {
  signals: SignalMethod
  discards: DiscardMethod
}

export const DEFAULT_CARDING: Carding = { signals: 'standard', discards: 'roman' }

/** Roman: tek sayı / küçük çift (2, 4) / büyük çift (8, 10). Lavinthal: küçük / büyük kart. */
export type DiscardCard = 'odd' | 'lowEven' | 'highEven' | 'low' | 'high'

export type Signal =
  | { kind: 'attitude'; like: boolean; high: boolean }
  | { kind: 'count'; even: boolean; high: boolean }
  /** `suit`: istenen renk. */
  | { kind: 'suitPreference'; suit: Suit; high: boolean }
  /** `suit`: istenen renk; `card` null = istenen rengi gösterecek kart yoktu. */
  | { kind: 'discard'; method: DiscardMethod; suit: Suit; card: DiscardCard | null }
  /** Ortağın rengine sayıyla dönüş; `remaining`: elde kalan kart sayısı. */
  | { kind: 'return'; remaining: number }
  /** Sanzatuya küçük kart (rua) çıkışında üçüncü el asla alır. */
  | { kind: 'aceWins' }

/**
 * - `given`: kural uygulandı.
 * - `dd`: kural başka bir kart istiyordu ama o kart löveye mal olurdu; çift kuklanın kartı oynandı.
 * - `noCard`: elde kuralın istediği kart yoktu.
 */
export type SignalStatus = 'given' | 'dd' | 'noCard'

export interface SignalNote {
  signal: Signal
  status: SignalStatus
}

export interface DefenseContext {
  /** Dağıtımın ilk hali. */
  deal: Deal
  /** Bu karttan önce ellerde kalan kartlar. */
  hands: Deal
  declarer: Seat
  strain: Strain
  /** Şimdiye kadar oynanan bütün kartlar, sırasıyla (sürmekte olan löve dahil). */
  history: readonly PlayedCard[]
  /** Sırası gelen oyuncu. */
  seat: Seat
}

export interface SignalChoice {
  note: SignalNote
  /** Oynanacak kart; null = çift kuklanın kendi seçimi. */
  card: Card | null
}

/**
 * Savunmacının apel kuralına göre kart seçimi. `optimal`: çift kukla açısından en iyi kartlar,
 * `legal`: oynanabilecek bütün kartlar. Deklare tarafı ya da kuralın konuşmadığı durumda null.
 */
export function defenderSignal(
  ctx: DefenseContext,
  optimal: readonly Card[],
  legal: readonly Card[],
  carding: Carding,
): SignalChoice | null {
  if (ctx.seat === ctx.declarer || ctx.seat === partnerOf(ctx.declarer)) return null
  const trick = currentTrick(ctx.history)
  if (trick.length === 0) return leadSignal(ctx, optimal, legal)
  const led = cardSuit(trick[0].card)
  if (!hasSuit(ctx.hands[ctx.seat], led)) return discardSignal(ctx, led, optimal, legal, carding)
  return followSignal(ctx, trick, optimal, legal, carding)
}

// --- Renge uyarken: tutum, sayı, renk tercihi ---

function followSignal(
  ctx: DefenseContext,
  trick: readonly PlayedCard[],
  optimal: readonly Card[],
  legal: readonly Card[],
  carding: Carding,
): SignalChoice | null {
  const { seat, strain } = ctx
  const hand = ctx.hands[seat]
  const led = cardSuit(trick[0].card)
  const leadRank = cardRank(trick[0].card)
  // Apel her renkte yalnızca ilk kartla verilir; sonraki kartlar sırayla devam eder.
  if (ctx.history.some((p) => p.seat === seat && cardSuit(p.card) === led)) return null

  const trump = trumpSuit(strain)
  const partnerLed = trick[0].seat === partnerOf(seat)
  const openingTrick = ctx.history.length < 4
  const holding = suitCards(hand, led)

  // Sanzatuya rua çıkış: üçüncü elde as varsa as ile alınır (sonra renk sayıyla dönülür).
  if (openingTrick && partnerLed && !trump && leadRank < RANK_TEN && trick.length === 2) {
    const ace = holding.find((c) => cardRank(c) === RANK_ACE)
    if (ace !== undefined) return choice({ kind: 'aceWins' }, optimal.includes(ace) ? ace : null)
  }

  const pool = (cards: readonly Card[]) => signalPool(cards, led, trick, seat, strain)
  const legalPool = pool(legal)
  // Tek kartla (ya da yalnızca löveyi alan kartlarla) apel verilemez.
  if (legalPool.length < 2) return null

  const dummy = partnerOf(ctx.declarer)
  const dummyHolding = [
    ...suitCards(ctx.hands[dummy], led),
    ...trick.filter((p) => p.seat === dummy).map((p) => p.card),
  ]
  const reverse = carding.signals === 'udca'

  let signal: Signal
  if (partnerLed && openingTrick && !trump && (leadRank === RANK_ACE || leadRank === RANK_QUEEN)) {
    // Sanzatuya As veya Dam çıkışı: tutum.
    const like = holdsHonour(holding)
    signal = { kind: 'attitude', like, high: like !== reverse }
  } else if (
    partnerLed &&
    openingTrick &&
    trump &&
    leadRank === RANK_ACE &&
    dummyHolding.length === 3 &&
    dummyHolding.every((c) => cardRank(c) < RANK_TEN)
  ) {
    // Koza karşı As çıkışı, yerde 3 boş kart: tutum. Koz oyununda ikili de beğenilir (çakma şansı).
    const like = holdsHonour(holding) || holding.length === 2
    signal = { kind: 'attitude', like, high: like !== reverse }
  } else if (partnerLed && trump && led !== trump && dummyHolding.length <= 1) {
    // Koza karşı atakta yer bu rengi çakacak: sayıya gerek yok, renk tercihi.
    const others = SUITS.filter((s) => s !== trump && s !== led)
    const suit = preferredSuit(hand, others)
    if (!suit) return null
    signal = { kind: 'suitPreference', suit, high: suit === higherSuit(others) }
  } else {
    // Oyun içinde (ve koza karşı): sayı. Çift sayıda kart = büyük-küçük.
    const even = holding.length % 2 === 0
    signal = { kind: 'count', even, high: even !== reverse }
  }

  const high = signal.high
  const pick = (cards: readonly Card[]) => (high ? highest(cards) : lowest(cards))
  const optimalPool = pool(optimal)
  if (optimalPool.length >= 2) return choice(signal, pick(optimalPool))
  const intended = pick(legalPool)
  return choice(signal, optimal.includes(intended) ? intended : null)
}

/**
 * Apel kartı adayları: çıkılan renkte. Üçüncü ve dördüncü elde löveyi alacak (ya da ortağın
 * kartını geçecek) kartlar apel değil, oyun kartıdır; ikinci elde arkadan oynayan var.
 * Küçük kartlar (2–10) yetiyorsa onörler korunur.
 */
function signalPool(
  cards: readonly Card[],
  led: Suit,
  trick: readonly PlayedCard[],
  seat: Seat,
  strain: Strain,
): Card[] {
  const inSuit = cards.filter(
    (c) =>
      cardSuit(c) === led &&
      (trick.length === 1 || trickWinner([...trick, { seat, card: c }], strain) !== seat),
  )
  const spots = inSuit.filter((c) => cardRank(c) <= RANK_TEN)
  return spots.length >= 2 ? spots : inSuit
}

// --- Çıkışta: çaktırırken renk tercihi, ortağın rengine sayıyla dönüş ---

function leadSignal(
  ctx: DefenseContext,
  optimal: readonly Card[],
  legal: readonly Card[],
): SignalChoice | null {
  const { seat } = ctx
  const hand = ctx.hands[seat]
  const partner = partnerOf(seat)
  const trump = trumpSuit(ctx.strain)

  // Ortağın çakacağı renkten giderken renk tercihi.
  if (trump && hasSuit(ctx.hands[partner], trump)) {
    const ruff = SUITS.find(
      (s) =>
        s !== trump && !hasSuit(ctx.hands[partner], s) && optimal.some((c) => cardSuit(c) === s),
    )
    if (ruff) {
      const others = SUITS.filter((s) => s !== trump && s !== ruff)
      const suit = preferredSuit(hand, others)
      const optimalInSuit = optimal.filter((c) => cardSuit(c) === ruff)
      const legalInSuit = legal.filter((c) => cardSuit(c) === ruff)
      if (suit && legalInSuit.length >= 2) {
        const high = suit === higherSuit(others)
        const pick = (cards: readonly Card[]) => (high ? highest(cards) : lowest(cards))
        const signal: Signal = { kind: 'suitPreference', suit, high }
        if (optimalInSuit.length >= 2) return choice(signal, pick(optimalInSuit))
        const intended = pick(legalInSuit)
        return choice(signal, optimal.includes(intended) ? intended : null)
      }
    }
  }

  // Ortağın çıkış rengine sayıyla dönüş: 2 kart kaldıysa büyüğü, daha çoksa baştaki 4. kart.
  const opening = ctx.history[0]
  if (!opening || opening.seat !== partner) return null
  const suit = cardSuit(opening.card)
  const ledBefore = ctx.history.some(
    (p, i) => i % 4 === 0 && p.seat === seat && cardSuit(p.card) === suit,
  )
  if (ledBefore || !optimal.some((c) => cardSuit(c) === suit)) return null
  const holding = suitCards(hand, suit)
  if (holding.length < 2) return null
  const fourth = suitCards(ctx.deal[seat], suit)[3]
  const intended =
    holding.length === 2
      ? holding[0]
      : fourth !== undefined && holding.includes(fourth)
        ? fourth
        : holding[holding.length - 1]
  return choice(
    { kind: 'return', remaining: holding.length },
    optimal.includes(intended) ? intended : null,
  )
}

// --- Defos: Roman (tek/çift) ve Lavinthal ---

function discardSignal(
  ctx: DefenseContext,
  led: Suit,
  optimal: readonly Card[],
  legal: readonly Card[],
  carding: Carding,
): SignalChoice | null {
  const { seat } = ctx
  const trump = trumpSuit(ctx.strain)
  const isDiscard = (c: Card) => cardSuit(c) !== trump
  // Çift kukla koz çakmayı seçtiyse defos yok.
  if (!optimal.some(isDiscard)) return null
  // Apel ilk defosla verilir.
  if (discardedBefore(ctx.history, seat)) return null

  const hand = ctx.hands[seat]
  const candidates = SUITS.filter((s) => s !== led && s !== trump)
  const want = preferredSuit(hand, candidates)
  if (!want) return null

  const method = carding.discards
  const meaning = (c: Card) => discardMeaning(c, want, candidates, method)
  const preferOrder = (a: Card, b: Card) => discardOrder(a, b, want, meaning)
  const matching = optimal.filter((c) => isDiscard(c) && meaning(c) !== null).sort(preferOrder)
  if (matching.length) {
    const card = matching[0]
    return choice({ kind: 'discard', method, suit: want, card: meaning(card) }, card)
  }
  const possible = legal.some((c) => isDiscard(c) && meaning(c) !== null)
  return {
    note: {
      signal: { kind: 'discard', method, suit: want, card: null },
      status: possible ? 'dd' : 'noCard',
    },
    card: null,
  }
}

/** Bu defos kartı istenen rengi (`want`) gösteriyor mu; gösteriyorsa nasıl. */
function discardMeaning(
  card: Card,
  want: Suit,
  candidates: readonly Suit[],
  method: DiscardMethod,
): DiscardCard | null {
  const suit = cardSuit(card)
  const face = cardRank(card) + 2
  if (method === 'roman') {
    // Tek sayı (3, 5, 7, 9) o rengi ister; çift sayı o rengi istemez, kalanlardan birini ister.
    if (face > 10) return null
    if (suit === want) return face % 2 === 1 ? 'odd' : null
    const rest = candidates.filter((s) => s !== suit)
    if ((face === 2 || face === 4) && want === lowerSuit(rest)) return 'lowEven'
    if ((face === 8 || face === 10) && want === higherSuit(rest)) return 'highEven'
    return null
  }
  // Lavinthal: koz ve oynanan renk dışında kalan iki renkten küçük kart düşüğünü, büyük kart
  // büyüğünü ister. Sanzatuda üç renk kalır; atılan renk de çıkınca ikisi.
  const rest = candidates.length === 2 ? candidates : candidates.filter((s) => s !== suit)
  if (!rest.includes(want)) return null
  if (face <= 6 && want === lowerSuit(rest)) return 'low'
  if (face >= 7 && want === higherSuit(rest)) return 'high'
  return null
}

/** Uygun defoslar arasında tercih: istenen renkten tek kart; yoksa başka renkten, uç kart. */
function discardOrder(
  a: Card,
  b: Card,
  want: Suit,
  meaning: (c: Card) => DiscardCard | null,
): number {
  const rank = (c: Card) => {
    const m = meaning(c)
    // Roman'da istenen renkten tek sayı doğrudan anlamdır; başka durumda istenen rengin
    // kartları korunur. Aynı türde: küçük kartlarda en küçüğü, büyüklerde en büyüğü.
    const group = m === 'odd' ? 0 : cardSuit(c) === want ? 2 : 1
    const extreme = m === 'high' || m === 'highEven' ? -cardRank(c) : cardRank(c)
    return group * 100 + extreme
  }
  return rank(a) - rank(b)
}

function discardedBefore(history: readonly PlayedCard[], seat: Seat): boolean {
  return history.some((p, i) => {
    if (p.seat !== seat) return false
    const lead = history[i - (i % 4)]
    return cardSuit(lead.card) !== cardSuit(p.card)
  })
}

// --- Yardımcılar ---

function choice(signal: Signal, card: Card | null): SignalChoice {
  return { note: { signal, status: card === null ? 'dd' : 'given' }, card }
}

function currentTrick(history: readonly PlayedCard[]): PlayedCard[] {
  return history.slice(history.length - (history.length % 4))
}

function trumpSuit(strain: Strain): Suit | null {
  return strain === 'N' ? null : strain
}

function hasSuit(hand: Hand, suit: Suit): boolean {
  return hand.some((c) => cardSuit(c) === suit)
}

/** Bir renkteki kartlar, büyükten küçüğe. */
function suitCards(hand: readonly Card[], suit: Suit): Card[] {
  return hand.filter((c) => cardSuit(c) === suit).sort((a, b) => cardRank(b) - cardRank(a))
}

/** Beğenme: renkte As, Papaz ya da Dam var. */
function holdsHonour(holding: readonly Card[]): boolean {
  return holding.some((c) => cardRank(c) >= RANK_QUEEN && cardRank(c) <= RANK_ACE)
}

/**
 * Savunmacının ortağından istediği renk: en çok HP olan renk (eşitse uzun, sonra yüksek renk).
 * Hiçbirinde onör yoksa istek yok.
 */
export function preferredSuit(hand: readonly Card[], suits: readonly Suit[]): Suit | null {
  let best: Suit | null = null
  let bestKey = [0, 0]
  for (const suit of suits) {
    const key = [suitHcp(hand, suit), suitCards(hand, suit).length]
    if (key[0] === 0) continue
    if (!best || key[0] > bestKey[0] || (key[0] === bestKey[0] && key[1] > bestKey[1])) {
      best = suit
      bestKey = key
    }
  }
  return best
}

/** Renk sırası ♠ > ♥ > ♦ > ♣. */
function higherSuit(suits: readonly Suit[]): Suit {
  return SUITS.find((s) => suits.includes(s))!
}

function lowerSuit(suits: readonly Suit[]): Suit {
  return [...SUITS].reverse().find((s) => suits.includes(s))!
}

function highest(cards: readonly Card[]): Card {
  return cards.reduce((a, b) => (cardRank(b) > cardRank(a) ? b : a))
}

function lowest(cards: readonly Card[]): Card {
  return cards.reduce((a, b) => (cardRank(b) < cardRank(a) ? b : a))
}
