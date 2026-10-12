import { describe, expect, it } from 'vitest'
import {
  SUITS,
  generateDeals,
  hcp,
  rotateSeat,
  shapeClass,
  suitLengths,
  type Hand,
  type Suit,
} from '../engine'
import { DEFAULT_TOPICS, groupByCategory } from './topics'

describe('DEFAULT_TOPICS', () => {
  it('has unique ids', () => {
    const ids = DEFAULT_TOPICS.map((topic) => topic.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(DEFAULT_TOPICS.map((topic) => [topic.name, topic] as const))(
    '%s produces 16 deals spread over all four seats',
    (_, topic) => {
      const result = generateDeals({ recipe: topic, count: 16, seed: topic.id })
      expect(result.status).toBe('ok')
      const dealers = result.deals.map((deal) => deal.dealer)
      for (const seat of ['N', 'E', 'S', 'W'] as const) {
        expect(dealers.filter((dealer) => dealer === seat)).toHaveLength(4)
      }
    },
  )

  it('minor opening hands are opening strength without a 5-card major or a NT opening', () => {
    const minor = DEFAULT_TOPICS.find((topic) => topic.id === '1-minor-opening')!
    const { deals } = generateDeals({ recipe: minor, count: 200, seed: 'minor' })
    for (const deal of deals) {
      const opener = deal.hands[deal.dealer]
      const points = hcp(opener)
      const lengths = suitLengths(opener)
      expect(points).toBeGreaterThanOrEqual(12)
      expect(points).toBeLessThanOrEqual(21)
      expect(lengths.S).toBeLessThanOrEqual(4)
      expect(lengths.H).toBeLessThanOrEqual(4)
      expect(Math.max(lengths.D, lengths.C)).toBeGreaterThanOrEqual(3)
      const balanced = shapeClass(opener) === 'balanced'
      expect(balanced && points >= 15 && points <= 17).toBe(false)
      expect(balanced && points >= 20).toBe(false)
    }
  })
})

/** Elin açacağı renk: en uzun, eşitlikte yüksek renk (motordan bağımsız hesap). */
function openingSuit(hand: Hand): Suit {
  const lengths = suitLengths(hand)
  return SUITS.reduce((best, suit) => (lengths[suit] > lengths[best] ? suit : best))
}

describe('competitive topics use the suit the opponent actually opens', () => {
  it('takeout doubler is short in the opened suit', () => {
    const topic = DEFAULT_TOPICS.find((t) => t.id === 'takeout-double')!
    const { deals } = generateDeals({ recipe: topic, count: 200, seed: 'takeout' })
    for (const deal of deals) {
      const opener = deal.hands[deal.dealer]
      const doubler = deal.hands[rotateSeat(deal.dealer, 1)]
      const opened = openingSuit(opener)
      expect(suitLengths(opener)[opened]).toBeGreaterThanOrEqual(5)
      expect(suitLengths(doubler)[opened]).toBeLessThanOrEqual(1)
      expect(hcp(doubler)).toBeGreaterThanOrEqual(12)
    }
  })

  it('overcaller has a 5+ suit other than the opened suit', () => {
    const topic = DEFAULT_TOPICS.find((t) => t.id === 'overcall')!
    const { deals } = generateDeals({ recipe: topic, count: 200, seed: 'overcall' })
    for (const deal of deals) {
      const opened = openingSuit(deal.hands[deal.dealer])
      const lengths = suitLengths(deal.hands[rotateSeat(deal.dealer, 1)])
      expect(lengths[opened]).toBeLessThanOrEqual(3)
      expect(SUITS.some((suit) => suit !== opened && lengths[suit] >= 5)).toBe(true)
    }
  })
})

describe('conventions after the opening', () => {
  it('Lebensohl: 1NT, a 2♦/2♥/2♠ overcall and a responder who has something to bid', () => {
    const topic = DEFAULT_TOPICS.find((t) => t.id === 'lebensohl')!
    const { deals } = generateDeals({ recipe: topic, count: 200, seed: 'lebensohl' })
    for (const deal of deals) {
      const opener = deal.hands[deal.dealer]
      const overcaller = deal.hands[rotateSeat(deal.dealer, 1)]
      const responder = deal.hands[rotateSeat(deal.dealer, 2)]
      expect(hcp(opener)).toBeGreaterThanOrEqual(15)
      expect(hcp(opener)).toBeLessThanOrEqual(17)
      expect(shapeClass(opener)).toBe('balanced')
      const overcalled = openingSuit(overcaller)
      expect(overcalled).not.toBe('C')
      expect(suitLengths(overcaller)[overcalled]).toBeGreaterThanOrEqual(5)
      expect(hcp(overcaller)).toBeGreaterThanOrEqual(8)
      expect(hcp(overcaller)).toBeLessThanOrEqual(16)
      const lengths = suitLengths(responder)
      expect(lengths[overcalled]).toBeLessThanOrEqual(4)
      expect(hcp(responder) >= 10 || shapeClass(responder) !== 'balanced').toBe(true)
    }
  })

  it('Check Back Stayman: 1m – 1M – 1NT (12–14) with a 5+ major responder', () => {
    const topic = DEFAULT_TOPICS.find((t) => t.id === 'check-back-stayman')!
    const { deals } = generateDeals({ recipe: topic, count: 200, seed: 'cbs' })
    for (const deal of deals) {
      const opener = deal.hands[deal.dealer]
      const responder = deal.hands[rotateSeat(deal.dealer, 2)]
      const openerLengths = suitLengths(opener)
      expect(hcp(opener)).toBeGreaterThanOrEqual(12)
      expect(hcp(opener)).toBeLessThanOrEqual(14)
      expect(shapeClass(opener)).toBe('balanced')
      expect(openerLengths.S).toBeLessThanOrEqual(3)
      expect(openerLengths.H).toBeLessThanOrEqual(4)
      const major = openingSuit(responder)
      expect(['S', 'H']).toContain(major)
      expect(suitLengths(responder)[major]).toBeGreaterThanOrEqual(5)
      expect(openerLengths[major]).toBeLessThanOrEqual(3)
      expect(hcp(responder)).toBeGreaterThanOrEqual(11)
    }
  })
})

describe('groupByCategory', () => {
  it('groups topics keeping first-seen order', () => {
    const groups = groupByCategory(DEFAULT_TOPICS, (topic) => topic.category)
    expect(groups.map(([category]) => category)).toEqual([
      'Açılışlar',
      '1NT sonrası',
      'Minör açılış sonrası',
      'Rekabet',
      'Şlem',
      'Oyun',
    ])
    expect(groups[0][1]).toHaveLength(5)
  })
})
