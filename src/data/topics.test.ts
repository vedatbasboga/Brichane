import { describe, expect, it } from 'vitest'
import { generateDeals } from '../engine'
import { DEFAULT_TOPICS, groupByCategory } from './topics'

describe('DEFAULT_TOPICS', () => {
  it('has unique ids', () => {
    const ids = DEFAULT_TOPICS.map((topic) => topic.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(DEFAULT_TOPICS.map((topic) => [topic.name, topic] as const))(
    '%s produces 16 deals',
    (_, topic) => {
      const result = generateDeals({ recipe: topic, count: 16, seed: topic.id })
      expect(result.status).toBe('ok')
    },
  )
})

describe('groupByCategory', () => {
  it('groups topics keeping first-seen order', () => {
    const groups = groupByCategory(DEFAULT_TOPICS)
    expect(groups.map(([category]) => category)).toEqual([
      'Açılışlar',
      '1SA sonrası',
      'Rekabet',
      'Şlem',
      'Oyun',
    ])
    expect(groups[0][1]).toHaveLength(4)
  })
})
