import { describe, expect, it } from 'vitest'
import { SEATS } from './cards'
import {
  controls,
  hcp,
  isBalanced,
  isSemiBalanced,
  longestFit,
  losingTrickCount,
  pairHcp,
  pairSuitLengths,
  shapeClass,
  shapePattern,
  suitHcp,
  suitLengths,
} from './evaluate'
import { parsePbnDeal, parsePbnHand as h } from './pbn'
import { SAMPLE_DEAL_PBN } from './testFixtures'

describe('hcp', () => {
  it('counts A=4 K=3 Q=2 J=1', () => {
    expect(hcp(h('AKQJ.432.432.432'))).toBe(10)
    expect(hcp(h('T98.T98.T987.T98'))).toBe(0)
    expect(hcp(h('A.K.QJ32.AKQJ432'))).toBe(4 + 3 + 3 + 10)
  })

  it('totals 40 across a deal', () => {
    const deal = parsePbnDeal(SAMPLE_DEAL_PBN)
    expect(SEATS.reduce((sum, seat) => sum + hcp(deal[seat]), 0)).toBe(40)
    expect(SEATS.map((seat) => hcp(deal[seat]))).toEqual([13, 7, 16, 4])
  })
})

describe('suitHcp', () => {
  it('counts honours in one suit only', () => {
    const hand = h('AKQ5432.J2.Q2.K2')
    expect(suitHcp(hand, 'S')).toBe(9)
    expect(suitHcp(hand, 'H')).toBe(1)
    expect(suitHcp(hand, 'D')).toBe(2)
    expect(suitHcp(hand, 'C')).toBe(3)
  })
})

describe('shape', () => {
  it('counts suit lengths', () => {
    expect(suitLengths(h('AK432.KJ32.T98.'))).toEqual({ S: 5, H: 4, D: 3, C: 0 })
  })

  it.each([
    ['AKQ2.KJ3.T98.765', '4-3-3-3', 'balanced'],
    ['AK32.KJ32.T98.76', '4-4-3-2', 'balanced'],
    ['AK432.KJ3.T98.76', '5-3-3-2', 'balanced'],
    ['76.KJ3.T98.AK432', '5-3-3-2', 'balanced'],
    ['AK432.KJ32.T9.76', '5-4-2-2', 'semi-balanced'],
    ['AK5432.KJ3.T9.76', '6-3-2-2', 'semi-balanced'],
    ['AK65432.KJ.T9.76', '7-2-2-2', 'semi-balanced'],
    ['AK32.KJ32.T982.7', '4-4-4-1', 'unbalanced'],
    ['AK432.KJ32.T98.7', '5-4-3-1', 'unbalanced'],
    ['AK432.KJ32.T982.', '5-4-4-0', 'unbalanced'],
    ['AK5432.KJ3.T98.7', '6-3-3-1', 'unbalanced'],
  ] as const)('%s → %s (%s)', (hand, pattern, cls) => {
    expect(shapePattern(h(hand))).toBe(pattern)
    expect(shapeClass(h(hand))).toBe(cls)
    expect(isBalanced(h(hand))).toBe(cls === 'balanced')
    expect(isSemiBalanced(h(hand))).toBe(cls === 'semi-balanced')
  })
})

describe('controls', () => {
  it('counts A=2 K=1', () => {
    expect(controls(h('AK32.KJ32.A982.7'))).toBe(6)
    expect(controls(h('QJ32.QJ32.QJ98.7'))).toBe(0)
  })
})

describe('losingTrickCount', () => {
  it.each([
    ['AKQ2.KJ3.T98.765', 8], // 0 + 2 + 3 + 3
    ['AKQJT98.A.K32.32', 4], // 0 + 0 (tekli A) + 2 + 2
    ['AK32.K.QJ32.5432', 7], // 1 + 1 (tekli K) + 2 + 3
    ['AQ.AK2.A5432.432', 7], // 1 (ikili AQ) + 1 + 2 + 3
    ['AKQ32.AKQ2.AKQ2.', 0], // renksiz 0
    ['5432.5432.432.32', 11], // 3 + 3 + 3 + 2
  ] as const)('%s → %i', (hand, losers) => {
    expect(losingTrickCount(h(hand))).toBe(losers)
  })
})

describe('partnership', () => {
  const deal = parsePbnDeal(SAMPLE_DEAL_PBN)

  it('sums partnership hcp', () => {
    expect(pairHcp(deal, 'NS')).toBe(29)
    expect(pairHcp(deal, 'EW')).toBe(11)
  })

  it('sums partnership suit lengths', () => {
    expect(pairSuitLengths(deal, 'NS')).toEqual({ S: 8, H: 7, D: 6, C: 5 })
    expect(pairSuitLengths(deal, 'EW')).toEqual({ S: 5, H: 6, D: 7, C: 8 })
  })

  it('finds the longest fit, optionally among given suits', () => {
    expect(longestFit(deal, 'NS')).toEqual({ suit: 'S', length: 8 })
    expect(longestFit(deal, 'NS', ['H', 'D'])).toEqual({ suit: 'H', length: 7 })
    expect(longestFit(deal, 'EW')).toEqual({ suit: 'C', length: 8 })
  })
})
