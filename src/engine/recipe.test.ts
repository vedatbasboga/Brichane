import { describe, expect, it } from 'vitest'
import { parsePbnDeal, parsePbnHand as h } from './pbn'
import {
  focusSeats,
  isOpeningSuit,
  matchesPair,
  matchesRecipe,
  matchesSeat,
  type Recipe,
  type SeatConstraint,
} from './recipe'
import { ONE_NT_RECIPE, SAMPLE_DEAL_PBN } from './testFixtures'

// Örnek dağıtım: N 13 HP 4333, E 7, S 16 HP 4432, W 4. NS ♠ fiti 8, NS 29 HP.
const deal = parsePbnDeal(SAMPLE_DEAL_PBN)

describe('matchesSeat', () => {
  it('checks hcp range inclusively', () => {
    expect(matchesSeat(deal.S, { hcp: [15, 17] })).toBe(true)
    expect(matchesSeat(deal.S, { hcp: [16, 16] })).toBe(true)
    expect(matchesSeat(deal.S, { hcp: [17, 20] })).toBe(false)
  })

  it('checks shape class', () => {
    expect(matchesSeat(deal.S, { shape: 'balanced' })).toBe(true)
    expect(matchesSeat(deal.S, { shape: 'semi-balanced' })).toBe(false)
    expect(matchesSeat(deal.S, { shape: 'any' })).toBe(true)
    expect(matchesSeat(h('AK432.KJ32.T9.76'), { shape: ['balanced', 'semi-balanced'] })).toBe(true)
    expect(matchesSeat(h('AK432.KJ32.T98.7'), { shape: ['balanced', 'semi-balanced'] })).toBe(false)
  })

  it('checks per-suit length ranges', () => {
    expect(matchesSeat(deal.S, { suits: { S: [4, 4], H: [4, 13] } })).toBe(true)
    expect(matchesSeat(deal.S, { suits: { C: [3, 13] } })).toBe(false)
  })

  it('checks that at least one of the given suits is in range', () => {
    const fiveCardMajor = { anySuit: { suits: ['S', 'H'] as const, length: [5, 13] as const } }
    expect(matchesSeat(h('AK432.KJ3.T98.76'), fiveCardMajor)).toBe(true)
    expect(matchesSeat(h('76.AK432.KJ3.T98'), fiveCardMajor)).toBe(true)
    expect(matchesSeat(h('KJ3.76.AK432.T98'), fiveCardMajor)).toBe(false)
  })

  it('checks controls and losing trick count', () => {
    // S: ♠7654 ♥T987 ♦AKQ ♣AK → kontrol 6, LTC 3+3+0+0 = 6
    expect(matchesSeat(deal.S, { controls: [6, 6], ltc: [6, 6] })).toBe(true)
    expect(matchesSeat(deal.S, { controls: [7, 12] })).toBe(false)
    expect(matchesSeat(deal.S, { ltc: [0, 5] })).toBe(false)
  })

  it('rejects hands that match an excluded constraint', () => {
    // S: 16 HP 4-4-3-2 — 1NT eli
    const notOneNt: SeatConstraint = {
      hcp: [12, 21],
      exclude: [{ hcp: [15, 17], shape: 'balanced' }],
    }
    expect(matchesSeat(deal.S, notOneNt)).toBe(false)
    expect(matchesSeat(deal.N, notOneNt)).toBe(true)
    expect(matchesSeat(deal.S, { exclude: [{ hcp: [0, 10] }, { suits: { C: [0, 1] } }] })).toBe(
      true,
    )
  })

  it('requires every condition to hold', () => {
    expect(matchesSeat(deal.S, { hcp: [15, 17], shape: 'balanced', suits: { S: [0, 3] } })).toBe(
      false,
    )
  })
})

describe('matchesPair', () => {
  it('checks partnership hcp', () => {
    expect(matchesPair(deal, 'NS', { hcp: [25, 30] })).toBe(true)
    expect(matchesPair(deal, 'NS', { hcp: [33, 40] })).toBe(false)
  })

  it('checks a fit in any suit or in given suits', () => {
    expect(matchesPair(deal, 'NS', { fit: { length: [8, 13] } })).toBe(true)
    expect(matchesPair(deal, 'NS', { fit: { suits: ['H', 'D', 'C'], length: [8, 13] } })).toBe(
      false,
    )
    expect(matchesPair(deal, 'EW', { fit: { suits: ['C'], length: [8, 8] } })).toBe(true)
  })
})

describe('matchesRecipe', () => {
  it('matches the 1NT recipe on the sample deal', () => {
    expect(matchesRecipe(deal, ONE_NT_RECIPE)).toBe(true)
  })

  it('fails when a seat constraint fails', () => {
    const recipe: Recipe = { ...ONE_NT_RECIPE, seats: { N: { hcp: [15, 17] } } }
    expect(matchesRecipe(deal, recipe)).toBe(false)
  })

  it('combines seat and pair constraints', () => {
    const recipe: Recipe = {
      ...ONE_NT_RECIPE,
      seats: { N: { shape: 'balanced' }, S: { shape: 'balanced' } },
      pair: { NS: { hcp: [25, 29] } },
    }
    expect(matchesRecipe(deal, recipe)).toBe(true)
    expect(matchesRecipe(deal, { ...recipe, pair: { NS: { hcp: [25, 27] } } })).toBe(false)
  })

  describe('topic suit', () => {
    // B'nin tek 5'lisi ♣; K'de ♣ 3'lü.
    const base: Recipe = {
      ...ONE_NT_RECIPE,
      topicSuit: { suits: ['S', 'H', 'D', 'C'] },
      seats: { W: { topicSuit: [5, 13] }, N: { topicSuit: [3, 3] } },
    }

    it('binds all seats to the same chosen suit', () => {
      expect(matchesRecipe(deal, base)).toBe(true)
      expect(
        matchesRecipe(deal, { ...base, seats: { ...base.seats, N: { topicSuit: [4, 13] } } }),
      ).toBe(false)
    })

    it('only considers the allowed suits', () => {
      expect(matchesRecipe(deal, { ...base, topicSuit: { suits: ['S', 'H'] } })).toBe(false)
    })

    it('applies the chosen suit inside exclusions', () => {
      const recipe: Recipe = {
        ...base,
        seats: { W: { topicSuit: [5, 13] }, N: { exclude: [{ topicSuit: [3, 3] }] } },
      }
      expect(matchesRecipe(deal, recipe)).toBe(false)
    })

    it('ignores seat topic-suit ranges when the recipe has no topic suit', () => {
      expect(
        matchesRecipe(deal, { ...base, topicSuit: undefined, seats: { N: { topicSuit: [9, 9] } } }),
      ).toBe(true)
    })
  })

  it('matches everything when there are no constraints', () => {
    expect(matchesRecipe(deal, { ...ONE_NT_RECIPE, seats: {}, pair: undefined })).toBe(true)
  })
})

describe('isOpeningSuit', () => {
  it('picks the longest suit, the higher one on ties', () => {
    const l = (S: number, H: number, D: number, C: number) => ({ S, H, D, C })
    expect(isOpeningSuit(l(5, 5, 2, 1), 'S')).toBe(true)
    expect(isOpeningSuit(l(5, 5, 2, 1), 'H')).toBe(false)
    expect(isOpeningSuit(l(4, 5, 2, 2), 'H')).toBe(true)
    expect(isOpeningSuit(l(4, 5, 2, 2), 'S')).toBe(false)
    expect(isOpeningSuit(l(1, 4, 4, 4), 'H')).toBe(true)
    expect(isOpeningSuit(l(1, 4, 4, 4), 'C')).toBe(false)
    expect(isOpeningSuit(l(2, 2, 3, 6), 'C')).toBe(true)
  })

  it('is applied through topicSuitLongest', () => {
    // B: ♠3 ♥654 ♦J432 ♣QJT98 — açacağı renk ♣
    const recipe: Recipe = {
      ...ONE_NT_RECIPE,
      topicSuit: { suits: ['D', 'C'] },
      seats: { W: { topicSuit: [4, 13], topicSuitLongest: true } },
    }
    expect(matchesRecipe(deal, recipe)).toBe(true)
    expect(matchesRecipe(deal, { ...recipe, topicSuit: { suits: ['D'] } })).toBe(false)
  })
})

describe('focusSeats', () => {
  it('lists constrained seats including pair members, in N E S W order', () => {
    expect(focusSeats(ONE_NT_RECIPE)).toEqual(['S'])
    expect(focusSeats({ ...ONE_NT_RECIPE, seats: { S: {}, E: {} } })).toEqual(['E', 'S'])
    expect(focusSeats({ ...ONE_NT_RECIPE, seats: {}, pair: { NS: { hcp: [33, 40] } } })).toEqual([
      'N',
      'S',
    ])
  })
})
