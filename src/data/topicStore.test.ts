import { describe, expect, it } from 'vitest'
import type { Recipe } from '../engine'
import { createLocalTopicRepository, mergeDefaults, type Topic } from './topicStore'

const recipe = (id: string, name = id): Recipe => ({ id, name, category: 'C', seats: {} })

const topic = (r: Recipe, patch: Partial<Topic> = {}): Topic => ({
  id: r.id,
  recipe: r,
  isDefault: true,
  archived: false,
  createdAt: 1,
  updatedAt: 1,
  ...patch,
})

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => void map.delete(key),
    setItem: (key, value) => void map.set(key, value),
  }
}

describe('mergeDefaults', () => {
  it('adds all defaults on first load', () => {
    const { topics, changed } = mergeDefaults([], [recipe('a'), recipe('b')], 100)
    expect(topics.map((t) => t.id)).toEqual(['a', 'b'])
    expect(changed).toHaveLength(2)
    expect(topics[0]).toMatchObject({ isDefault: true, archived: false, createdAt: 100 })
  })

  it('adds defaults introduced later without touching others', () => {
    const stored = [topic(recipe('a'))]
    const { topics, changed } = mergeDefaults(stored, [recipe('a'), recipe('b')], 100)
    expect(topics.map((t) => t.id)).toEqual(['a', 'b'])
    expect(changed.map((t) => t.id)).toEqual(['b'])
  })

  it('refreshes untouched defaults but keeps edited ones', () => {
    const stored = [topic(recipe('a', 'eski')), topic(recipe('b', 'hocanın'), { updatedAt: 5 })]
    const { topics, changed } = mergeDefaults(
      stored,
      [recipe('a', 'yeni'), recipe('b', 'kod')],
      100,
    )
    expect(topics.map((t) => t.recipe.name)).toEqual(['yeni', 'hocanın'])
    expect(changed.map((t) => t.id)).toEqual(['a'])
  })

  it('keeps user topics after defaults, oldest first', () => {
    const stored = [
      topic(recipe('u2'), { isDefault: false, createdAt: 9, updatedAt: 9 }),
      topic(recipe('u1'), { isDefault: false, createdAt: 3, updatedAt: 3 }),
    ]
    const { topics } = mergeDefaults(stored, [recipe('a')], 100)
    expect(topics.map((t) => t.id)).toEqual(['a', 'u1', 'u2'])
  })
})

describe('local topic repository', () => {
  it('saves, updates and loads topics', async () => {
    const repo = createLocalTopicRepository(memoryStorage())
    expect(await repo.load()).toEqual([])
    await repo.save(topic(recipe('a')))
    await repo.save(topic(recipe('b')))
    await repo.save(topic(recipe('a', 'değişti'), { updatedAt: 2 }))
    const loaded = await repo.load()
    expect(loaded.map((t) => [t.id, t.recipe.name])).toEqual([
      ['a', 'değişti'],
      ['b', 'b'],
    ])
  })

  it('treats corrupt data as empty', async () => {
    const storage = memoryStorage()
    storage.setItem('brichane.topics.v1', '{bozuk')
    expect(await createLocalTopicRepository(storage).load()).toEqual([])
  })
})
