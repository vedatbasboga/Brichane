import { describe, expect, it } from 'vitest'
import { RANK_ACE, RANK_TEN, makeCard } from './cards'
import { dealRandom } from './deal'
import { dealToPbn, handToPbn, parsePbnDeal, parsePbnHand } from './pbn'
import { seededRng } from './random'
import { SAMPLE_DEAL_PBN } from './testFixtures'

describe('PBN hands', () => {
  it('parses and formats a hand', () => {
    const hand = parsePbnHand('AKQ2.KJ3.T98.765')
    expect(hand).toHaveLength(13)
    expect(hand[0]).toBe(makeCard('S', RANK_ACE))
    expect(hand).toContain(makeCard('D', RANK_TEN))
    expect(handToPbn(hand)).toBe('AKQ2.KJ3.T98.765')
  })

  it('handles voids and lowercase', () => {
    expect(handToPbn(parsePbnHand('akq32.akq2.akq2.'))).toBe('AKQ32.AKQ2.AKQ2.')
  })

  it('rejects invalid hands', () => {
    expect(() => parsePbnHand('AKQ.KJ3.T98')).toThrow()
    expect(() => parsePbnHand('AKX.KJ3.T98.765')).toThrow()
    expect(() => parsePbnHand('AAK.KJ3.T98.765')).toThrow()
  })
})

describe('PBN deals', () => {
  it('round-trips a deal', () => {
    expect(dealToPbn(parsePbnDeal(SAMPLE_DEAL_PBN))).toBe(SAMPLE_DEAL_PBN)
    const deal = dealRandom(seededRng('pbn'))
    expect(parsePbnDeal(dealToPbn(deal))).toEqual(deal)
  })

  it('starts from the given seat, clockwise', () => {
    const deal = parsePbnDeal(SAMPLE_DEAL_PBN)
    expect(dealToPbn(deal, 'S')).toBe(
      'S:7654.T987.AKQ.AK 3.654.J432.QJT98 AKQ2.KJ3.T98.765 JT98.AQ2.765.432',
    )
    expect(parsePbnDeal(dealToPbn(deal, 'S'))).toEqual(deal)
  })

  it('rejects incomplete or duplicate deals', () => {
    expect(() => parsePbnDeal('AKQ2.KJ3.T98.765')).toThrow()
    expect(() => parsePbnDeal('N:AKQ2.KJ3.T98.765 JT98.AQ2.765.432')).toThrow()
    expect(() =>
      parsePbnDeal('N:AKQ2.KJ3.T98.765 AKQ2.KJ3.T98.765 7654.T987.AKQ.AK 3.654.J432.QJT98'),
    ).toThrow()
  })
})
