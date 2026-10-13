import { describe, expect, it } from 'vitest'
import { formatPar, formatParContract, formatParScore } from './ddFormat'

describe('par formatting', () => {
  it.each([
    ['4S-NS', '4♠ NS'],
    ['3N-E+1', '4NT E'],
    ['5D*-EW-3', '5♦x EW −3'],
    ['1H-S+2', '3♥ S'],
    ['1S-NS+2', '3♠ NS'],
    ['7C*-W-6', '7♣x W −6'],
  ])('%s → %s', (raw, text) => {
    expect(formatParContract(raw)).toBe(text)
  })

  it('keeps unknown formats as-is', () => {
    expect(formatParContract('?')).toBe('?')
  })

  it('writes the score for the side that gains it', () => {
    expect(formatParScore(420)).toBe('NS +420')
    expect(formatParScore(-620)).toBe('EW +620')
    expect(formatParScore(0)).toBe('0')
  })

  it('joins several par contracts', () => {
    expect(formatPar({ score: 420, contracts: ['4S-NS', '4H-NS'] })).toBe('4♠ NS / 4♥ NS · NS +420')
    expect(formatPar({ score: 0, contracts: [] })).toBe('Pas')
  })
})
