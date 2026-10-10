import { describe, expect, it } from 'vitest'
import { generateDeals, hcp, shapeClass, suitLengths } from '../engine'
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

describe('groupByCategory', () => {
  it('groups topics keeping first-seen order', () => {
    const groups = groupByCategory(DEFAULT_TOPICS, (topic) => topic.category)
    expect(groups.map(([category]) => category)).toEqual([
      'Açılışlar',
      '1SA sonrası',
      'Rekabet',
      'Şlem',
      'Oyun',
    ])
    expect(groups[0][1]).toHaveLength(5)
  })
})
