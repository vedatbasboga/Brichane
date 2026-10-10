// Konu deposu. Şimdilik tarayıcıda (localStorage); Faz 5'te aynı arayüzle Firestore'a geçecek.

import type { Recipe } from '../engine'

export interface Topic {
  id: string
  recipe: Recipe
  isDefault: boolean
  /** Silme yok; arşivlenen konu seçicide görünmez. */
  archived: boolean
  createdAt: number
  updatedAt: number
}

export interface TopicRepository {
  load(): Promise<Topic[]>
  save(topic: Topic): Promise<void>
}

/**
 * Kayıtlı konulara eksik varsayılanları ekler. Hiç düzenlenmemiş varsayılanlar
 * (createdAt === updatedAt) koddaki güncel tarifle yenilenir.
 */
export function mergeDefaults(
  stored: readonly Topic[],
  defaults: readonly Recipe[],
  now: number,
): { topics: Topic[]; changed: Topic[] } {
  const byId = new Map(stored.map((topic) => [topic.id, topic]))
  const changed: Topic[] = []
  for (const recipe of defaults) {
    const existing = byId.get(recipe.id)
    if (!existing) {
      const topic: Topic = {
        id: recipe.id,
        recipe,
        isDefault: true,
        archived: false,
        createdAt: now,
        updatedAt: now,
      }
      byId.set(recipe.id, topic)
      changed.push(topic)
    } else if (
      existing.isDefault &&
      existing.createdAt === existing.updatedAt &&
      JSON.stringify(existing.recipe) !== JSON.stringify(recipe)
    ) {
      const topic = { ...existing, recipe }
      byId.set(recipe.id, topic)
      changed.push(topic)
    }
  }
  // Varsayılanlar kod sırasıyla önde, sonra kullanıcının konuları oluşturulma sırasıyla.
  const defaultIds = new Set(defaults.map((recipe) => recipe.id))
  const topics = [
    ...defaults.map((recipe) => byId.get(recipe.id)!),
    ...[...byId.values()]
      .filter((topic) => !defaultIds.has(topic.id))
      .sort((a, b) => a.createdAt - b.createdAt),
  ]
  return { topics, changed }
}

const STORAGE_KEY = 'brichane.topics.v1'

export function createLocalTopicRepository(storage: Storage = localStorage): TopicRepository {
  const read = (): Topic[] => {
    try {
      const raw = storage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Topic[]) : []
    } catch {
      return []
    }
  }
  return {
    async load() {
      return read()
    },
    async save(topic) {
      const topics = read()
      const index = topics.findIndex((t) => t.id === topic.id)
      if (index >= 0) topics[index] = topic
      else topics.push(topic)
      storage.setItem(STORAGE_KEY, JSON.stringify(topics))
    },
  }
}
