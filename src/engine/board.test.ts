import { describe, expect, it } from 'vitest'
import { boardDealer, boardVulnerability, isVulnerable } from './board'

describe('boardDealer', () => {
  it('cycles N E S W', () => {
    expect([1, 2, 3, 4, 5, 8, 16, 17].map(boardDealer)).toEqual([
      'N',
      'E',
      'S',
      'W',
      'N',
      'W',
      'W',
      'N',
    ])
  })

  it('rejects invalid board numbers', () => {
    expect(() => boardDealer(0)).toThrow(RangeError)
    expect(() => boardDealer(1.5)).toThrow(RangeError)
  })
})

describe('boardVulnerability', () => {
  it('follows the standard 16-board cycle', () => {
    const boards = Array.from({ length: 16 }, (_, i) => boardVulnerability(i + 1))
    // prettier-ignore
    expect(boards).toEqual([
      'None', 'NS', 'EW', 'All',
      'NS', 'EW', 'All', 'None',
      'EW', 'All', 'None', 'NS',
      'All', 'None', 'NS', 'EW',
    ])
  })

  it('repeats after 16 boards', () => {
    for (let board = 1; board <= 16; board++) {
      expect(boardVulnerability(board + 16)).toBe(boardVulnerability(board))
    }
  })
})

describe('isVulnerable', () => {
  it('checks a seat against the vulnerability', () => {
    expect(isVulnerable('None', 'N')).toBe(false)
    expect(isVulnerable('All', 'E')).toBe(true)
    expect(isVulnerable('NS', 'S')).toBe(true)
    expect(isVulnerable('NS', 'W')).toBe(false)
    expect(isVulnerable('EW', 'E')).toBe(true)
  })
})
