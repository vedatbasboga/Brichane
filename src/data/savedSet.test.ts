import { describe, expect, it } from 'vitest'
import { generateDeals, tricksFromDds, type DdResult } from '../engine'
import { ONE_NT_RECIPE } from '../engine/testFixtures'
import {
  buildNewSet,
  ddFromSaved,
  ddToSaved,
  defaultSetTitle,
  fromSavedDeal,
  toSavedDeal,
} from './savedSet'

const result = generateDeals({
  recipe: { ...ONE_NT_RECIPE, placement: undefined },
  count: 8,
  seed: 'kayit',
})

describe('saved deals', () => {
  it('round-trips a generated deal through PBN', () => {
    for (const deal of result.deals) {
      const saved = toSavedDeal(deal)
      expect(saved.pbn).toMatch(/^N:/)
      const view = fromSavedDeal(saved)
      expect(view).toEqual({
        board: deal.board,
        dealer: deal.dealer,
        vul: deal.vul,
        hands: deal.hands,
        focusSeats: deal.focusSeats,
      })
    }
  })

  it('stores only serialisable fields (no undefined, no rotation)', () => {
    const saved = toSavedDeal(result.deals[0])
    expect(Object.keys(saved).sort()).toEqual(['board', 'dealer', 'focusSeats', 'pbn', 'vul'])
    expect(JSON.parse(JSON.stringify(saved))).toEqual(saved)
  })
})

describe('buildNewSet', () => {
  it('copies seed, recipe and deals, trims text', () => {
    const set = buildNewSet({
      title: '  Ders 1  ',
      notes: ' not ',
      topicId: '1nt-opening',
      recipe: ONE_NT_RECIPE,
      result,
    })
    expect(set.title).toBe('Ders 1')
    expect(set.notes).toBe('not')
    expect(set.seed).toBe('kayit')
    expect(set.count).toBe(8)
    expect(set.deals).toHaveLength(8)
    expect(set.topicName).toBe(ONE_NT_RECIPE.name)
    expect(set.recipe).toBe(ONE_NT_RECIPE)
  })

  it('uses the number of found deals as count (partial results)', () => {
    const partial = { ...result, status: 'exhausted' as const, deals: result.deals.slice(0, 3) }
    expect(
      buildNewSet({ title: 't', notes: '', topicId: 'x', recipe: ONE_NT_RECIPE, result: partial })
        .count,
    ).toBe(3)
  })
})

describe('defaultSetTitle', () => {
  it('combines topic name and Turkish date', () => {
    expect(defaultSetTitle('Stayman', new Date(2026, 9, 10))).toBe('Stayman · 10.10.2026')
  })
})

describe('double dummy persistence', () => {
  const tricks = tricksFromDds([
    [10, 3, 10, 3],
    [10, 3, 10, 3],
    [8, 4, 8, 4],
    [8, 5, 8, 5],
    [8, 3, 8, 3],
  ])
  const dd: DdResult = { tricks, par: { score: 420, contracts: ['4S-NS', '4H-NS'] } }

  it('saves only when every board has a result', () => {
    expect(ddToSaved([dd, undefined], 2)).toBeUndefined()
    expect(ddToSaved([dd], 2)).toBeUndefined()
    expect(ddToSaved(undefined, 2)).toBeUndefined()
    expect(ddToSaved([dd, dd], 2)).toEqual({
      dd: ['8aa8833345' + '8aa8833345', '8aa8833345' + '8aa8833345'],
      par: [dd.par, dd.par],
    })
  })

  it('round-trips through the saved form', () => {
    const saved = ddToSaved([dd, dd], 2)!
    expect(ddFromSaved(saved)).toEqual([dd, dd])
    expect(ddFromSaved({})).toBeUndefined()
  })

  it('is included in a new set only when complete', () => {
    const base = { title: 't', notes: '', topicId: 'x', recipe: ONE_NT_RECIPE }
    const partial = { ...result, deals: result.deals.slice(0, 2) }
    expect(buildNewSet({ ...base, result: partial, dd: [dd] }).dd).toBeUndefined()
    const full = buildNewSet({ ...base, result: partial, dd: [dd, dd] })
    expect(full.dd).toHaveLength(2)
    expect(full.par).toHaveLength(2)
  })
})
