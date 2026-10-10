import { describe, expect, it } from 'vitest'
import { DEFAULT_TOPICS } from './topics'
import {
  draftToRecipe,
  emptyDraft,
  emptyExcludeDraft,
  recipeToDraft,
  validateDraft,
  type TopicDraft,
} from './topicDraft'

function namedDraft(): TopicDraft {
  return { ...emptyDraft('t1'), name: 'Deneme', category: 'Test' }
}

describe('recipe ↔ draft', () => {
  it.each(DEFAULT_TOPICS.map((topic) => [topic.name, topic] as const))(
    '%s round-trips unchanged',
    (_, topic) => {
      expect(draftToRecipe(recipeToDraft(topic))).toEqual(topic)
    },
  )

  it('treats full ranges as no constraint', () => {
    const draft = namedDraft()
    draft.seats.S.enabled = true
    expect(draftToRecipe(draft).seats).toEqual({ S: {} })
  })

  it('omits disabled seats and pairs even if they have values', () => {
    const draft = namedDraft()
    draft.seats.N.hcp = [10, 12]
    draft.pairs.NS.hcp = [25, 27]
    const recipe = draftToRecipe(draft)
    expect(recipe.seats).toEqual({})
    expect(recipe.pair).toBeUndefined()
  })

  it('writes shapes as a single class, an ordered list or nothing', () => {
    const draft = namedDraft()
    draft.seats.S.enabled = true
    draft.seats.S.shapes = ['semi-balanced', 'balanced']
    expect(draftToRecipe(draft).seats.S?.shape).toEqual(['balanced', 'semi-balanced'])
    draft.seats.S.shapes = ['unbalanced']
    expect(draftToRecipe(draft).seats.S?.shape).toBe('unbalanced')
    draft.seats.S.shapes = ['balanced', 'semi-balanced', 'unbalanced']
    expect(draftToRecipe(draft).seats.S?.shape).toBeUndefined()
  })

  it('drops empty exclusions', () => {
    const draft = namedDraft()
    draft.seats.S.enabled = true
    draft.seats.S.exclude = [emptyExcludeDraft(), { hcp: [15, 17], shapes: ['balanced'] }]
    expect(draftToRecipe(draft).seats.S?.exclude).toEqual([{ hcp: [15, 17], shape: 'balanced' }])
  })

  it('only writes a fit when its length is constrained', () => {
    const draft = namedDraft()
    draft.pairs.NS.enabled = true
    draft.pairs.NS.fitSuits = ['H']
    expect(draftToRecipe(draft).pair).toEqual({ NS: {} })
    draft.pairs.NS.fitLength = [8, 13]
    expect(draftToRecipe(draft).pair).toEqual({ NS: { fit: { suits: ['H'], length: [8, 13] } } })
  })

  it('trims text and keeps fixed placement and topic suit', () => {
    const draft = namedDraft()
    draft.name = '  Ad  '
    draft.description = '   '
    draft.placement = 'fixed'
    draft.topicSuits = ['C', 'S']
    const recipe = draftToRecipe(draft)
    expect(recipe.name).toBe('Ad')
    expect(recipe.description).toBeUndefined()
    expect(recipe.placement).toBe('fixed')
    expect(recipe.topicSuit).toEqual({ suits: ['S', 'C'] })
  })
})

describe('validateDraft', () => {
  it('accepts every default topic', () => {
    for (const topic of DEFAULT_TOPICS) expect(validateDraft(recipeToDraft(topic))).toEqual([])
  })

  it('accepts an empty draft (no constraints)', () => {
    expect(validateDraft(emptyDraft('x'))).toEqual([])
  })

  it('rejects inverted ranges on enabled seats only', () => {
    const draft = namedDraft()
    draft.seats.N.hcp = [20, 10]
    expect(validateDraft(draft)).toEqual([])
    draft.seats.N.enabled = true
    expect(validateDraft(draft)).toHaveLength(1)
  })

  it('rejects impossible suit length combinations', () => {
    const draft = namedDraft()
    draft.seats.S.enabled = true
    draft.seats.S.suits.S = [5, 13]
    draft.seats.S.suits.H = [5, 13]
    draft.seats.S.suits.D = [4, 13]
    expect(validateDraft(draft)).toHaveLength(1)
    draft.seats.S.suits = { S: [0, 3], H: [0, 3], D: [0, 3], C: [0, 3] }
    expect(validateDraft(draft)).toHaveLength(1)
  })

  it('requires a topic suit when a seat uses it', () => {
    const draft = namedDraft()
    draft.seats.E.enabled = true
    draft.seats.E.topicSuit = [5, 13]
    expect(validateDraft(draft)).toHaveLength(1)
    draft.topicSuits = ['H']
    expect(validateDraft(draft)).toEqual([])
  })
})
