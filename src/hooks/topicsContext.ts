import { createContext, useContext } from 'react'
import type { Recipe } from '../engine'
import type { Topic } from '../data/topicStore'

export interface TopicsContextValue {
  topics: Topic[]
  loading: boolean
  error: string | null
  /** Yeni konu ekler veya var olanı günceller. */
  saveRecipe: (recipe: Recipe) => Promise<void>
  setArchived: (id: string, archived: boolean) => Promise<void>
}

export const TopicsContext = createContext<TopicsContextValue | null>(null)

export function useTopics(): TopicsContextValue {
  const value = useContext(TopicsContext)
  if (!value) throw new Error('useTopics must be used inside TopicsProvider')
  return value
}
