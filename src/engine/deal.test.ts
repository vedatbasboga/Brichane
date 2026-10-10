import { describe, expect, it } from 'vitest'
import { SEATS, makeCard, sortHand, RANK_ACE } from './cards'
import { dealRandom, dealUnsorted, rotateDeal, shuffle } from './deal'
import { seededRng } from './random'

describe('dealRandom', () => {
  it('deals 4 sorted hands of 13 covering all 52 cards', () => {
    const deal = dealRandom(seededRng('full'))
    for (const seat of SEATS) {
      expect(deal[seat]).toHaveLength(13)
      expect(deal[seat]).toEqual(sortHand(deal[seat]))
    }
    const all = SEATS.flatMap((seat) => deal[seat])
    expect(new Set(all).size).toBe(52)
    expect(Math.min(...all)).toBe(0)
    expect(Math.max(...all)).toBe(51)
  })

  it('is reproducible with the same seed', () => {
    expect(dealRandom(seededRng('same'))).toEqual(dealRandom(seededRng('same')))
    expect(dealRandom(seededRng('same'))).not.toEqual(dealRandom(seededRng('other')))
  })

  it('places each card in each seat about 1/4 of the time', () => {
    const rng = seededRng('fairness')
    const aceOfSpades = makeCard('S', RANK_ACE)
    const counts = { N: 0, E: 0, S: 0, W: 0 }
    const deals = 20_000
    for (let i = 0; i < deals; i++) {
      const deal = dealUnsorted(rng)
      for (const seat of SEATS) if (deal[seat].includes(aceOfSpades)) counts[seat]++
    }
    // σ ≈ 61; ±300 ≈ 5σ
    for (const seat of SEATS) expect(Math.abs(counts[seat] - deals / 4)).toBeLessThan(300)
  })
})

describe('shuffle', () => {
  it('returns a permutation of the input', () => {
    const items = Array.from({ length: 52 }, (_, i) => i)
    const shuffled = shuffle([...items], seededRng('perm'))
    expect([...shuffled].sort((a, b) => a - b)).toEqual(items)
    expect(shuffled).not.toEqual(items)
  })
})

describe('rotateDeal', () => {
  const deal = dealRandom(seededRng('rotate'))

  it('rotates 180° by swapping N↔S and E↔W', () => {
    const rotated = rotateDeal(deal, 2)
    expect(rotated.N).toBe(deal.S)
    expect(rotated.S).toBe(deal.N)
    expect(rotated.E).toBe(deal.W)
    expect(rotated.W).toBe(deal.E)
  })

  it('rotates one seat clockwise', () => {
    expect(rotateDeal(deal, 1).E).toBe(deal.N)
  })

  it('returns to the original after a full turn', () => {
    expect(rotateDeal(rotateDeal(deal, 2), 2)).toEqual(deal)
  })
})
