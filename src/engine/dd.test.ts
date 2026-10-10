import { describe, expect, it } from 'vitest'
import {
  contractLevel,
  parCells,
  parseParContract,
  tricksFromDds,
  tricksFromHex,
  tricksToHex,
} from './dd'

// K bütün ♠, D bütün ♥, G bütün ♦, B bütün ♣ — DDS'in gerçek çıktısı.
const ALL_SUITS_TABLE = [
  [13, 0, 13, 0], // ♠
  [0, 13, 0, 13], // ♥
  [13, 0, 13, 0], // ♦
  [0, 13, 0, 13], // ♣
  [0, 0, 0, 0], // NT
]

describe('tricksFromDds', () => {
  it('maps DDS strain/hand order to seats and strains', () => {
    const tricks = tricksFromDds(ALL_SUITS_TABLE)
    expect(tricks.N).toEqual({ S: 13, H: 0, D: 13, C: 0, N: 0 })
    expect(tricks.E).toEqual({ S: 0, H: 13, D: 0, C: 13, N: 0 })
    expect(tricks.S.D).toBe(13)
    expect(tricks.W.C).toBe(13)
  })
})

describe('hex encoding (PBN DoubleDummyTricks)', () => {
  it('writes NT ♠ ♥ ♦ ♣ per declarer in N E S W order', () => {
    const tricks = tricksFromDds(ALL_SUITS_TABLE)
    expect(tricksToHex(tricks)).toBe('0d0d0' + '00d0d' + '0d0d0' + '00d0d')
  })

  it('round-trips', () => {
    const tricks = tricksFromDds([
      [10, 3, 10, 3],
      [10, 3, 10, 3],
      [8, 4, 8, 4],
      [8, 5, 8, 5],
      [8, 3, 8, 3],
    ])
    const hex = tricksToHex(tricks)
    expect(hex).toBe('8aa88' + '33345' + '8aa88' + '33345')
    expect(tricksFromHex(hex)).toEqual(tricks)
  })

  it('rejects malformed strings', () => {
    expect(() => tricksFromHex('123')).toThrow()
    expect(() => tricksFromHex('e'.repeat(20))).toThrow()
  })
})

describe('parseParContract', () => {
  it.each([
    ['4S-NS', { level: 4, strain: 'S', doubled: false, seats: ['N', 'S'], result: 0 }],
    ['3N-E+1', { level: 3, strain: 'N', doubled: false, seats: ['E'], result: 1 }],
    ['5D*-EW-3', { level: 5, strain: 'D', doubled: true, seats: ['E', 'W'], result: -3 }],
    ['7C*-S-3', { level: 7, strain: 'C', doubled: true, seats: ['S'], result: -3 }],
    ['1H-S+2', { level: 1, strain: 'H', doubled: false, seats: ['S'], result: 2 }],
  ] as const)('%s', (raw, expected) => {
    expect(parseParContract(raw)).toEqual(expected)
  })

  it('returns null for unknown formats', () => {
    expect(parseParContract('pass')).toBeNull()
    expect(parseParContract('8S-NS')).toBeNull()
  })
})

describe('contractLevel', () => {
  it('converts tricks to the highest makeable level', () => {
    expect(contractLevel(13)).toBe(7)
    expect(contractLevel(10)).toBe(4)
    expect(contractLevel(7)).toBe(1)
    expect(contractLevel(6)).toBeNull()
    expect(contractLevel(0)).toBeNull()
  })
})

describe('parCells', () => {
  it('marks the declarer and strain of each par contract', () => {
    expect([...parCells({ score: 420, contracts: ['4S-NS', '4H-NS'] })].sort()).toEqual([
      'NH',
      'NS',
      'SH',
      'SS',
    ])
    expect([...parCells({ score: -100, contracts: ['5D*-E-1'] })]).toEqual(['ED'])
    expect(parCells({ score: 0, contracts: [] }).size).toBe(0)
  })
})
