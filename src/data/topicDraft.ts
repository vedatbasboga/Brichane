// Tarif editörünün form modeli: her alan dolu, "tam aralık" = koşul yok.
// recipeToDraft / draftToRecipe ile Recipe'e çevrilir.

import {
  PAIRS,
  SEATS,
  SUITS,
  type PairConstraint,
  type Pair,
  type Placement,
  type Range,
  type Recipe,
  type Seat,
  type SeatConstraint,
  type ShapeClass,
  type ShapeConstraint,
  type Suit,
} from '../engine'
import { tr } from '../i18n/tr'

export type Bounds = [number, number]

export const SEAT_HCP_BOUNDS: Bounds = [0, 37]
export const PAIR_HCP_BOUNDS: Bounds = [0, 40]
export const LENGTH_BOUNDS: Bounds = [0, 13]
export const CONTROLS_BOUNDS: Bounds = [0, 12]
export const LTC_BOUNDS: Bounds = [0, 12]

export const SHAPE_CLASSES: readonly ShapeClass[] = ['balanced', 'semi-balanced', 'unbalanced']

export interface ExcludeDraft {
  hcp: Bounds
  /** Boş = dağılım fark etmez. */
  shapes: ShapeClass[]
}

export interface SeatDraft {
  enabled: boolean
  hcp: Bounds
  shapes: ShapeClass[]
  suits: Record<Suit, Bounds>
  /** Boş = "en az biri" koşulu yok. */
  anySuits: Suit[]
  anyLength: Bounds
  topicSuit: Bounds
  controls: Bounds
  ltc: Bounds
  exclude: ExcludeDraft[]
}

export interface PairDraft {
  enabled: boolean
  hcp: Bounds
  /** Boş = herhangi bir renk. */
  fitSuits: Suit[]
  fitLength: Bounds
}

export interface TopicDraft {
  id: string
  name: string
  category: string
  description: string
  dealer: Seat
  placement: Placement
  /** Boş = konu rengi yok. */
  topicSuits: Suit[]
  seats: Record<Seat, SeatDraft>
  pairs: Record<Pair, PairDraft>
}

const full = (bounds: Bounds): Bounds => [bounds[0], bounds[1]]
const toBounds = (range: Range | undefined, bounds: Bounds): Bounds =>
  range ? [range[0], range[1]] : full(bounds)
const isFull = (value: Bounds, bounds: Bounds) => value[0] <= bounds[0] && value[1] >= bounds[1]
const orUndefined = (value: Bounds, bounds: Bounds): Range | undefined =>
  isFull(value, bounds) ? undefined : [value[0], value[1]]

export function emptyExcludeDraft(): ExcludeDraft {
  return { hcp: full(SEAT_HCP_BOUNDS), shapes: [] }
}

export function emptySeatDraft(): SeatDraft {
  return {
    enabled: false,
    hcp: full(SEAT_HCP_BOUNDS),
    shapes: [],
    suits: {
      S: full(LENGTH_BOUNDS),
      H: full(LENGTH_BOUNDS),
      D: full(LENGTH_BOUNDS),
      C: full(LENGTH_BOUNDS),
    },
    anySuits: [],
    anyLength: full(LENGTH_BOUNDS),
    topicSuit: full(LENGTH_BOUNDS),
    controls: full(CONTROLS_BOUNDS),
    ltc: full(LTC_BOUNDS),
    exclude: [],
  }
}

export function emptyPairDraft(): PairDraft {
  return {
    enabled: false,
    hcp: full(PAIR_HCP_BOUNDS),
    fitSuits: [],
    fitLength: full(LENGTH_BOUNDS),
  }
}

export function emptyDraft(id: string): TopicDraft {
  return {
    id,
    name: '',
    category: '',
    description: '',
    dealer: 'S',
    placement: 'balanced',
    topicSuits: [],
    seats: { N: emptySeatDraft(), E: emptySeatDraft(), S: emptySeatDraft(), W: emptySeatDraft() },
    pairs: { NS: emptyPairDraft(), EW: emptyPairDraft() },
  }
}

function shapesFrom(shape: ShapeConstraint | undefined): ShapeClass[] {
  if (!shape || shape === 'any') return []
  return typeof shape === 'string' ? [shape] : [...shape]
}

function shapeFrom(shapes: readonly ShapeClass[]): ShapeConstraint | undefined {
  if (shapes.length === 0 || shapes.length === SHAPE_CLASSES.length) return undefined
  // Form sırasından bağımsız, sabit sırada yaz.
  const ordered = SHAPE_CLASSES.filter((cls) => shapes.includes(cls))
  return ordered.length === 1 ? ordered[0] : ordered
}

function seatToDraft(c: SeatConstraint | undefined): SeatDraft {
  const draft = emptySeatDraft()
  if (!c) return draft
  return {
    enabled: true,
    hcp: toBounds(c.hcp, SEAT_HCP_BOUNDS),
    shapes: shapesFrom(c.shape),
    suits: {
      S: toBounds(c.suits?.S, LENGTH_BOUNDS),
      H: toBounds(c.suits?.H, LENGTH_BOUNDS),
      D: toBounds(c.suits?.D, LENGTH_BOUNDS),
      C: toBounds(c.suits?.C, LENGTH_BOUNDS),
    },
    anySuits: c.anySuit ? [...c.anySuit.suits] : [],
    anyLength: toBounds(c.anySuit?.length, LENGTH_BOUNDS),
    topicSuit: toBounds(c.topicSuit, LENGTH_BOUNDS),
    controls: toBounds(c.controls, CONTROLS_BOUNDS),
    ltc: toBounds(c.ltc, LTC_BOUNDS),
    exclude: (c.exclude ?? []).map((ex) => ({
      hcp: toBounds(ex.hcp, SEAT_HCP_BOUNDS),
      shapes: shapesFrom(ex.shape),
    })),
  }
}

function draftToSeat(d: SeatDraft): SeatConstraint {
  const c: SeatConstraint = {}
  const hcp = orUndefined(d.hcp, SEAT_HCP_BOUNDS)
  if (hcp) c.hcp = hcp
  const shape = shapeFrom(d.shapes)
  if (shape) c.shape = shape
  const suits: Partial<Record<Suit, Range>> = {}
  for (const suit of SUITS) {
    const range = orUndefined(d.suits[suit], LENGTH_BOUNDS)
    if (range) suits[suit] = range
  }
  if (Object.keys(suits).length) c.suits = suits
  if (d.anySuits.length) {
    c.anySuit = {
      suits: SUITS.filter((s) => d.anySuits.includes(s)),
      length: [d.anyLength[0], d.anyLength[1]],
    }
  }
  const topicSuit = orUndefined(d.topicSuit, LENGTH_BOUNDS)
  if (topicSuit) c.topicSuit = topicSuit
  const controls = orUndefined(d.controls, CONTROLS_BOUNDS)
  if (controls) c.controls = controls
  const ltc = orUndefined(d.ltc, LTC_BOUNDS)
  if (ltc) c.ltc = ltc
  const exclude = d.exclude
    .map((ex) => {
      const e: SeatConstraint = {}
      const exHcp = orUndefined(ex.hcp, SEAT_HCP_BOUNDS)
      if (exHcp) e.hcp = exHcp
      const exShape = shapeFrom(ex.shapes)
      if (exShape) e.shape = exShape
      return e
    })
    // Boş hariç tutma her eli dışlar; anlamsız olduğu için atılır.
    .filter((e) => Object.keys(e).length > 0)
  if (exclude.length) c.exclude = exclude
  return c
}

function pairToDraft(c: PairConstraint | undefined): PairDraft {
  if (!c) return emptyPairDraft()
  return {
    enabled: true,
    hcp: toBounds(c.hcp, PAIR_HCP_BOUNDS),
    fitSuits: c.fit?.suits ? [...c.fit.suits] : [],
    fitLength: toBounds(c.fit?.length, LENGTH_BOUNDS),
  }
}

function draftToPair(d: PairDraft): PairConstraint {
  const c: PairConstraint = {}
  const hcp = orUndefined(d.hcp, PAIR_HCP_BOUNDS)
  if (hcp) c.hcp = hcp
  const fitLength = orUndefined(d.fitLength, LENGTH_BOUNDS)
  if (fitLength) {
    c.fit = { length: fitLength }
    if (d.fitSuits.length) c.fit.suits = SUITS.filter((s) => d.fitSuits.includes(s))
  }
  return c
}

export function recipeToDraft(recipe: Recipe): TopicDraft {
  return {
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    description: recipe.description ?? '',
    dealer: recipe.dealer ?? 'S',
    placement: recipe.placement ?? 'balanced',
    topicSuits: recipe.topicSuit ? [...recipe.topicSuit.suits] : [],
    seats: {
      N: seatToDraft(recipe.seats.N),
      E: seatToDraft(recipe.seats.E),
      S: seatToDraft(recipe.seats.S),
      W: seatToDraft(recipe.seats.W),
    },
    pairs: { NS: pairToDraft(recipe.pair?.NS), EW: pairToDraft(recipe.pair?.EW) },
  }
}

export function draftToRecipe(draft: TopicDraft): Recipe {
  const recipe: Recipe = {
    id: draft.id,
    name: draft.name.trim(),
    category: draft.category.trim(),
    dealer: draft.dealer,
    seats: {},
  }
  const description = draft.description.trim()
  if (description) recipe.description = description
  if (draft.placement === 'fixed') recipe.placement = 'fixed'
  if (draft.topicSuits.length) {
    recipe.topicSuit = { suits: SUITS.filter((s) => draft.topicSuits.includes(s)) }
  }
  for (const seat of SEATS) {
    if (draft.seats[seat].enabled) recipe.seats[seat] = draftToSeat(draft.seats[seat])
  }
  const pair: Partial<Record<Pair, PairConstraint>> = {}
  for (const p of PAIRS) if (draft.pairs[p].enabled) pair[p] = draftToPair(draft.pairs[p])
  if (Object.keys(pair).length) recipe.pair = pair
  return recipe
}

/** Kullanıcıya gösterilecek hata mesajları; boş dizi = geçerli. */
export function validateDraft(draft: TopicDraft): string[] {
  const errors: string[] = []
  const e = tr.editor.errors

  const checkRange = (where: string, field: string, value: Bounds) => {
    if (value[0] > value[1]) errors.push(e.range(where, field))
  }

  let usesTopicSuit = false
  for (const seat of SEATS) {
    const d = draft.seats[seat]
    if (!d.enabled) continue
    const where = tr.seatNames[seat]
    checkRange(where, tr.editor.hcp, d.hcp)
    for (const suit of SUITS) checkRange(where, tr.suitNames[suit], d.suits[suit])
    checkRange(where, tr.editor.anySuit, d.anyLength)
    checkRange(where, tr.editor.topicSuitLength, d.topicSuit)
    checkRange(where, tr.editor.controls, d.controls)
    checkRange(where, tr.editor.ltc, d.ltc)
    d.exclude.forEach((ex) => checkRange(where, tr.editor.exclude, ex.hcp))
    const minSum = SUITS.reduce((sum, suit) => sum + d.suits[suit][0], 0)
    const maxSum = SUITS.reduce((sum, suit) => sum + d.suits[suit][1], 0)
    if (minSum > 13) errors.push(e.suitMinSum(where))
    if (maxSum < 13) errors.push(e.suitMaxSum(where))
    if (!isFull(d.topicSuit, LENGTH_BOUNDS)) usesTopicSuit = true
  }
  for (const p of PAIRS) {
    const d = draft.pairs[p]
    if (!d.enabled) continue
    const where = tr.editor.pairSection(tr.pairs[p])
    checkRange(where, tr.editor.pairHcp, d.hcp)
    checkRange(where, tr.editor.fit, d.fitLength)
  }
  if (usesTopicSuit && draft.topicSuits.length === 0) errors.push(e.topicSuitMissing)
  return errors
}
