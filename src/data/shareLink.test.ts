import { describe, expect, it } from 'vitest'
import { DEFAULT_TOPICS, CUSTOM_TOPIC_ID } from './topics'
import { draftToRecipe, emptyDraft } from './topicDraft'
import { SHARE_VERSION, parseShareParams, recipeFingerprint, toShareParams } from './shareLink'

const oneNt = DEFAULT_TOPICS[0]

function roundTrip(params: URLSearchParams, topics = DEFAULT_TOPICS) {
  return parseShareParams(new URLSearchParams(params.toString()), topics)
}

describe('share links', () => {
  it('round-trips a preset topic', () => {
    const params = toShareParams({ topicId: oneNt.id, recipe: oneNt, count: 16, seed: 'k7m2xq9p' })
    expect(params.get('tarif')).toBeNull()
    expect(roundTrip(params)).toEqual({
      status: 'ok',
      target: { topicId: oneNt.id, recipe: oneNt, count: 16, seed: 'k7m2xq9p' },
      warning: null,
    })
  })

  it('round-trips a custom recipe inside the link (Turkish characters too)', () => {
    const draft = { ...emptyDraft(CUSTOM_TOPIC_ID), name: 'Özel dağılım', category: 'Özel' }
    draft.seats.S.enabled = true
    draft.seats.S.hcp = [10, 16]
    draft.seats.S.suits.S = [5, 13]
    draft.topicSuits = ['H']
    const recipe = draftToRecipe(draft)
    const params = toShareParams({ topicId: CUSTOM_TOPIC_ID, recipe, count: 8, seed: 'abc' })
    const parsed = roundTrip(params)
    expect(parsed.status).toBe('ok')
    if (parsed.status !== 'ok') return
    expect(parsed.target.recipe.seats).toEqual(recipe.seats)
    expect(parsed.target.recipe.topicSuit).toEqual({ suits: ['H'] })
    expect(parsed.warning).toBeNull()
  })

  it('warns when the topic changed after the link was made', () => {
    const params = toShareParams({ topicId: oneNt.id, recipe: oneNt, count: 16, seed: 'x' })
    const changed = DEFAULT_TOPICS.map((t) =>
      t.id === oneNt.id ? { ...t, seats: { S: { hcp: [14, 16] as const } } } : t,
    )
    const parsed = roundTrip(params, changed)
    expect(parsed.status === 'ok' && parsed.warning).toBe('topicChanged')
  })

  it('ignores name/description changes in the fingerprint', () => {
    expect(recipeFingerprint({ ...oneNt, name: 'Yeni ad', description: 'x' })).toBe(
      recipeFingerprint(oneNt),
    )
  })

  it('warns on an older link version', () => {
    const params = toShareParams({ topicId: oneNt.id, recipe: oneNt, count: 16, seed: 'x' })
    params.set('v', String(SHARE_VERSION - 1))
    const parsed = roundTrip(params)
    expect(parsed.status === 'ok' && parsed.warning).toBe('versionChanged')
  })

  it('returns none without a code and invalid for broken links', () => {
    expect(parseShareParams(new URLSearchParams(''), DEFAULT_TOPICS)).toEqual({ status: 'none' })
    const bad = (query: string) =>
      parseShareParams(new URLSearchParams(query), DEFAULT_TOPICS).status
    expect(bad('kod=a&el=0&konu=1nt-opening')).toBe('invalid')
    expect(bad('kod=a&el=500&konu=1nt-opening')).toBe('invalid')
    expect(bad('kod=a&el=16&konu=yok-boyle')).toBe('invalid')
    expect(bad('kod=a&el=16&konu=custom&tarif=bozuk!!')).toBe('invalid')
  })
})
