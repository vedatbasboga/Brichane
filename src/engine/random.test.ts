import { describe, expect, it } from 'vitest'
import { cryptoRng, randomInt, randomSeed, seededRng, type Rng } from './random'

function take(rng: Rng, n: number): number[] {
  return Array.from({ length: n }, () => rng.nextUint32())
}

describe('seededRng', () => {
  it('gives the same sequence for the same seed', () => {
    expect(take(seededRng('ders-1'), 50)).toEqual(take(seededRng('ders-1'), 50))
  })

  it('gives different sequences for different seeds', () => {
    expect(take(seededRng('ders-1'), 10)).not.toEqual(take(seededRng('ders-2'), 10))
  })

  it('handles Turkish characters deterministically', () => {
    expect(take(seededRng('çğış'), 5)).toEqual(take(seededRng('çğış'), 5))
    expect(take(seededRng('çğış'), 5)).not.toEqual(take(seededRng('cgis'), 5))
  })

  it('returns unsigned 32-bit integers', () => {
    for (const x of take(seededRng('range'), 1000)) {
      expect(Number.isInteger(x)).toBe(true)
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(2 ** 32)
    }
  })
})

describe('randomInt', () => {
  it('stays within bounds', () => {
    const rng = seededRng('bounds')
    for (let i = 0; i < 1000; i++) {
      const x = randomInt(rng, 7)
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(7)
    }
  })

  it('is roughly uniform', () => {
    const rng = seededRng('uniform')
    const counts = new Array(6).fill(0)
    const samples = 60_000
    for (let i = 0; i < samples; i++) counts[randomInt(rng, 6)]++
    for (const count of counts) expect(Math.abs(count - samples / 6)).toBeLessThan(500)
  })

  it('rejects invalid bounds', () => {
    const rng = seededRng('x')
    expect(() => randomInt(rng, 0)).toThrow(RangeError)
    expect(() => randomInt(rng, 2.5)).toThrow(RangeError)
  })
})

describe('cryptoRng', () => {
  it('produces varying values across buffer refills', () => {
    const values = take(cryptoRng(), 600)
    expect(new Set(values).size).toBeGreaterThan(590)
  })
})

describe('randomSeed', () => {
  it('produces short readable seeds', () => {
    const seed = randomSeed()
    expect(seed).toMatch(/^[a-z2-9]{8}$/)
    expect(seed).not.toMatch(/[01ilo]/)
  })

  it('is deterministic with a given rng', () => {
    expect(randomSeed(8, seededRng('s'))).toBe(randomSeed(8, seededRng('s')))
  })
})
