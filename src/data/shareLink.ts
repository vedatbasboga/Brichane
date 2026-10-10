// Paylaşım bağlantısı: konu + el sayısı + (gizli) kod → aynı eller yeniden üretilir.
// Kullanıcı kodu görmez; bağlantı tek başına yeterlidir.

import type { Recipe } from '../engine'
import { tr } from '../i18n/tr'
import { CUSTOM_TOPIC_ID, MAX_DEALS } from './topics'
import { draftToRecipe, recipeToDraft, validateDraft } from './topicDraft'

/** Üretim yöntemi bilerek değiştirilirse artırılır; eski bağlantılar uyarı gösterir. */
export const SHARE_VERSION = 1

const PARAM = {
  version: 'v',
  topic: 'konu',
  count: 'el',
  seed: 'kod',
  fingerprint: 'iz',
  recipe: 'tarif',
} as const

export interface ShareTarget {
  topicId: string
  recipe: Recipe
  count: number
  seed: string
}

export type ShareWarning = 'topicChanged' | 'versionChanged'

export type ShareParseResult =
  | { status: 'none' }
  | { status: 'invalid' }
  | { status: 'ok'; target: ShareTarget; warning: ShareWarning | null }

export function toShareParams(target: ShareTarget): URLSearchParams {
  const params = new URLSearchParams()
  params.set(PARAM.version, String(SHARE_VERSION))
  params.set(PARAM.topic, target.topicId)
  params.set(PARAM.count, String(target.count))
  params.set(PARAM.seed, target.seed)
  if (target.topicId === CUSTOM_TOPIC_ID) params.set(PARAM.recipe, encodeRecipe(target.recipe))
  else params.set(PARAM.fingerprint, recipeFingerprint(target.recipe))
  return params
}

export function parseShareParams(
  params: URLSearchParams,
  topics: readonly Recipe[],
): ShareParseResult {
  const seed = params.get(PARAM.seed)?.trim()
  if (!seed) return { status: 'none' }

  const count = Number(params.get(PARAM.count))
  if (!Number.isInteger(count) || count < 1 || count > MAX_DEALS) return { status: 'invalid' }

  const versionChanged = Number(params.get(PARAM.version) ?? SHARE_VERSION) !== SHARE_VERSION
  const topicId = params.get(PARAM.topic) ?? ''

  if (topicId === CUSTOM_TOPIC_ID) {
    const recipe = decodeRecipe(params.get(PARAM.recipe) ?? '')
    if (!recipe) return { status: 'invalid' }
    return {
      status: 'ok',
      target: { topicId, recipe, count, seed },
      warning: versionChanged ? 'versionChanged' : null,
    }
  }

  const recipe = topics.find((t) => t.id === topicId)
  if (!recipe) return { status: 'invalid' }
  const topicChanged = params.get(PARAM.fingerprint) !== recipeFingerprint(recipe)
  return {
    status: 'ok',
    target: { topicId, recipe, count, seed },
    warning: topicChanged ? 'topicChanged' : versionChanged ? 'versionChanged' : null,
  }
}

/** Yalnızca elleri etkileyen alanlardan kısa iz (ad/açıklama değişikliği izi bozmaz). */
export function recipeFingerprint(recipe: Recipe): string {
  const { dealer, seats, pair, placement, topicSuit } = recipe
  return fnv1a(stableStringify({ dealer, seats, pair, placement, topicSuit }))
}

function encodeRecipe(recipe: Recipe): string {
  const { dealer, seats, pair, placement, topicSuit } = recipe
  const bytes = new TextEncoder().encode(
    JSON.stringify({ dealer, seats, pair, placement, topicSuit }),
  )
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Bağlantıdaki tarifi okur ve form modelinden geçirerek temizler; geçersizse null. */
function decodeRecipe(encoded: string): Recipe | null {
  try {
    const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))
    const json = new TextDecoder().decode(Uint8Array.from(binary, (ch) => ch.charCodeAt(0)))
    const parsed = JSON.parse(json) as Partial<Recipe>
    const draft = recipeToDraft({
      ...parsed,
      seats: parsed.seats ?? {},
      id: CUSTOM_TOPIC_ID,
      name: tr.generate.customTitle,
      category: tr.generate.customGroup,
    })
    if (validateDraft(draft).length) return null
    return draftToRecipe(draft)
  } catch {
    return null
  }
}

function stableStringify(value: unknown): string {
  if (value === undefined) return 'null'
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`
}

function fnv1a(text: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}
