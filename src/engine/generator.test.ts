import { describe, expect, it } from 'vitest'
import { boardDealer, boardVulnerability } from './board'
import { SEATS, seatDistance, sortHand } from './cards'
import { rotateDeal } from './deal'
import { generateDeals, placeDeal, type GenerateProgress } from './generator'
import { matchesRecipe, matchesSeat, type Recipe } from './recipe'
import { ONE_NT_RECIPE } from './testFixtures'

describe('generateDeals', () => {
  it('generates 100 1NT deals in under a second', () => {
    const start = performance.now()
    const result = generateDeals({ recipe: ONE_NT_RECIPE, count: 100, seed: 'speed' })
    const elapsed = performance.now() - start
    expect(result.status).toBe('ok')
    expect(result.deals).toHaveLength(100)
    expect(elapsed).toBeLessThan(1000)
  })

  it('only returns deals that match the recipe', () => {
    const { deals } = generateDeals({ recipe: ONE_NT_RECIPE, count: 200, seed: 'match' })
    for (const deal of deals) {
      expect(matchesRecipe(deal.hands, ONE_NT_RECIPE)).toBe(true)
      const all = SEATS.flatMap((seat) => deal.hands[seat])
      expect(new Set(all).size).toBe(52)
      for (const seat of SEATS) expect(deal.hands[seat]).toEqual(sortHand(deal.hands[seat]))
    }
  })

  it('gives the same set for the same seed', () => {
    const a = generateDeals({ recipe: ONE_NT_RECIPE, count: 16, seed: 'ders-12' })
    const b = generateDeals({ recipe: ONE_NT_RECIPE, count: 16, seed: 'ders-12' })
    const c = generateDeals({ recipe: ONE_NT_RECIPE, count: 16, seed: 'ders-13' })
    expect(a).toEqual(b)
    expect(c.deals).not.toEqual(a.deals)
  })

  it('treats surrounding whitespace in the seed as insignificant', () => {
    const a = generateDeals({ recipe: ONE_NT_RECIPE, count: 4, seed: ' abc ' })
    const b = generateDeals({ recipe: ONE_NT_RECIPE, count: 4, seed: 'abc' })
    expect(a).toEqual(b)
  })

  it('creates a random seed when none is given, and that seed reproduces the set', () => {
    const first = generateDeals({ recipe: ONE_NT_RECIPE, count: 8, seed: '  ' })
    expect(first.seed).toMatch(/^[a-z2-9]{8}$/)
    const again = generateDeals({ recipe: ONE_NT_RECIPE, count: 8, seed: first.seed })
    expect(again.deals).toEqual(first.deals)
  })

  it('numbers boards and uses the recipe dealer with the standard vulnerability cycle', () => {
    const { deals } = generateDeals({ recipe: ONE_NT_RECIPE, count: 16, seed: 'boards' })
    deals.forEach((deal, i) => {
      expect(deal.board).toBe(i + 1)
      expect(deal.dealer).toBe('S')
      expect(deal.vul).toBe(boardVulnerability(i + 1))
      expect(deal.focusSeats).toEqual(['S'])
      expect(deal.rotation).toBe(0)
    })
  })

  it('uses the board dealer when the recipe has none', () => {
    const recipe: Recipe = { ...ONE_NT_RECIPE, dealer: undefined }
    const { deals } = generateDeals({ recipe, count: 8, seed: 'dealer', firstBoard: 5 })
    deals.forEach((deal, i) => {
      expect(deal.board).toBe(5 + i)
      expect(deal.dealer).toBe(boardDealer(5 + i))
    })
  })

  describe('balanced placement', () => {
    const balanced: Recipe = { ...ONE_NT_RECIPE, placement: undefined }

    it('is the default and moves the topic hand to the standard board dealer', () => {
      const { deals } = generateDeals({ recipe: balanced, count: 16, seed: 'balanced' })
      for (const deal of deals) {
        expect(deal.dealer).toBe(boardDealer(deal.board))
        expect(deal.vul).toBe(boardVulnerability(deal.board))
        expect(deal.rotation).toBe(seatDistance('S', deal.dealer))
        expect(deal.focusSeats).toEqual([deal.dealer])
        // Geri çevrilince tarife uyar ve 1SA eli dağıtıcıdadır.
        expect(matchesRecipe(rotateDeal(deal.hands, -deal.rotation), ONE_NT_RECIPE)).toBe(true)
        expect(matchesSeat(deal.hands[deal.dealer], ONE_NT_RECIPE.seats.S!)).toBe(true)
      }
    })

    it('gives each seat the topic hand equally often', () => {
      const { deals } = generateDeals({ recipe: balanced, count: 16, seed: 'equal' })
      const counts = { N: 0, E: 0, S: 0, W: 0 }
      for (const deal of deals) counts[deal.focusSeats[0]]++
      expect(counts).toEqual({ N: 4, E: 4, S: 4, W: 4 })
    })

    it('alternates partnership topics between NS and EW', () => {
      const pairRecipe: Recipe = {
        ...balanced,
        seats: { N: { shape: 'balanced' }, S: { shape: 'balanced' } },
      }
      const { deals } = generateDeals({ recipe: pairRecipe, count: 4, seed: 'pair' })
      expect(deals.map((deal) => deal.focusSeats)).toEqual([
        ['N', 'S'],
        ['E', 'W'],
        ['N', 'S'],
        ['E', 'W'],
      ])
    })

    it('respects firstBoard', () => {
      const { deals } = generateDeals({ recipe: balanced, count: 2, seed: 'fb', firstBoard: 3 })
      expect(deals.map((deal) => deal.dealer)).toEqual(['S', 'W'])
      expect(deals.map((deal) => deal.rotation)).toEqual([0, 1])
    })
  })

  it('keeps hands where the recipe puts them with fixed placement', () => {
    expect(placeDeal(ONE_NT_RECIPE, 1)).toEqual({ dealer: 'S', rotation: 0 })
    expect(placeDeal({ ...ONE_NT_RECIPE, dealer: undefined }, 2)).toEqual({
      dealer: 'E',
      rotation: 0,
    })
  })

  it('stops at maxAttempts and reports the observed probability', () => {
    const impossible: Recipe = { ...ONE_NT_RECIPE, seats: { S: { hcp: [38, 40] } } }
    const result = generateDeals({ recipe: impossible, count: 4, seed: 'rare', maxAttempts: 5000 })
    expect(result.status).toBe('exhausted')
    expect(result.attempts).toBe(5000)
    expect(result.deals).toHaveLength(0)
    expect(result.observedProbability).toBe(0)
  })

  it('estimates the observed probability', () => {
    const always: Recipe = { ...ONE_NT_RECIPE, seats: {} }
    expect(generateDeals({ recipe: always, count: 10, seed: 'p' }).observedProbability).toBe(1)

    // S 15–17 HP dengeli, 5'li majör yok: yaklaşık %4
    const { observedProbability } = generateDeals({
      recipe: ONE_NT_RECIPE,
      count: 500,
      seed: 'prob',
    })
    expect(observedProbability).toBeGreaterThan(0.02)
    expect(observedProbability).toBeLessThan(0.07)
  })

  it('reports progress up to the requested count', () => {
    const updates: GenerateProgress[] = []
    generateDeals({ recipe: ONE_NT_RECIPE, count: 5, seed: 'progress' }, (p) => updates.push(p))
    expect(updates.map((p) => p.found)).toEqual([1, 2, 3, 4, 5])
    expect(updates.every((p) => p.count === 5)).toBe(true)
  })

  it('rejects an invalid count', () => {
    expect(() => generateDeals({ recipe: ONE_NT_RECIPE, count: 0 })).toThrow(RangeError)
  })
})
