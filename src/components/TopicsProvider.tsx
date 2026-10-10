import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_TOPICS } from '../data/topics'
import { mergeDefaults, type Topic, type TopicRepository } from '../data/topicStore'
import type { Recipe } from '../engine'
import { TopicsContext, type TopicsContextValue } from '../hooks/topicsContext'

interface TopicsProviderProps {
  repository: TopicRepository
  children: ReactNode
}

export function TopicsProvider({ repository, children }: TopicsProviderProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const stored = await repository.load()
        const { topics: merged, changed } = mergeDefaults(stored, DEFAULT_TOPICS, Date.now())
        await Promise.all(changed.map((topic) => repository.save(topic)))
        if (!cancelled) setTopics(merged)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [repository])

  const saveTopic = useCallback(
    async (topic: Topic) => {
      await repository.save(topic)
      setTopics((current) => {
        const index = current.findIndex((t) => t.id === topic.id)
        if (index < 0) return [...current, topic]
        const next = [...current]
        next[index] = topic
        return next
      })
    },
    [repository],
  )

  const saveRecipe = useCallback(
    async (recipe: Recipe) => {
      const now = Date.now()
      const existing = topics.find((t) => t.id === recipe.id)
      await saveTopic(
        existing
          ? { ...existing, recipe, updatedAt: Math.max(now, existing.createdAt + 1) }
          : {
              id: recipe.id,
              recipe,
              isDefault: false,
              archived: false,
              createdAt: now,
              updatedAt: now,
            },
      )
    },
    [topics, saveTopic],
  )

  const setArchived = useCallback(
    async (id: string, archived: boolean) => {
      const existing = topics.find((t) => t.id === id)
      if (existing) {
        const updatedAt = Math.max(Date.now(), existing.createdAt + 1)
        await saveTopic({ ...existing, archived, updatedAt })
      }
    },
    [topics, saveTopic],
  )

  const value = useMemo<TopicsContextValue>(
    () => ({ topics, loading, error, saveRecipe, setArchived }),
    [topics, loading, error, saveRecipe, setArchived],
  )

  return <TopicsContext value={value}>{children}</TopicsContext>
}
