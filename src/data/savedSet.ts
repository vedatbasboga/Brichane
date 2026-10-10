// Firestore'a kaydedilen setin modeli ve üretim sonucundan dönüşüm (Firebase'den bağımsız).

import {
  dealToPbn,
  parsePbnDeal,
  tricksFromHex,
  tricksToHex,
  type DdPar,
  type DdResult,
  type GenerateResult,
  type GeneratedDeal,
  type Recipe,
  type Seat,
  type Vulnerability,
} from '../engine'

/** Ekranda bir board'u çizmek için gereken alanlar. */
export type DealView = Pick<GeneratedDeal, 'board' | 'dealer' | 'vul' | 'hands' | 'focusSeats'>

export interface SavedDeal {
  board: number
  dealer: Seat
  vul: Vulnerability
  /** Kuzeyden başlayan PBN dağıtım metni. */
  pbn: string
  focusSeats: Seat[]
}

/** Yeni set dokümanının istemcinin yazdığı alanları (zaman damgaları sunucuda). */
export interface NewSetInput {
  title: string
  topicId: string
  topicName: string
  /** Tarifin kayıt anındaki kopyası; özel dağılım da böylece kalıcı olur. */
  recipe: Recipe
  seed: string
  count: number
  deals: SavedDeal[]
  notes: string
  /** Çift kukla löve tabloları (board sırasıyla, PBN DoubleDummyTricks biçimi); hepsi varsa. */
  dd?: string[]
  par?: DdPar[]
}

export interface SavedSet extends NewSetInput {
  id: string
  archived: boolean
  /** "Sil" ile işaretlendi; listede ve bağlantıda görünmez. */
  deleted: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export const MAX_TITLE_LENGTH = 200
export const MAX_NOTES_LENGTH = 20000
export const MAX_BOARD_NOTE_LENGTH = 5000

export function toSavedDeal(deal: DealView): SavedDeal {
  return {
    board: deal.board,
    dealer: deal.dealer,
    vul: deal.vul,
    pbn: dealToPbn(deal.hands, 'N'),
    focusSeats: [...deal.focusSeats],
  }
}

export function fromSavedDeal(deal: SavedDeal): DealView {
  return {
    board: deal.board,
    dealer: deal.dealer,
    vul: deal.vul,
    hands: parsePbnDeal(deal.pbn),
    focusSeats: deal.focusSeats ?? [],
  }
}

/** Bütün board'ların sonucu varsa kayıt biçimine çevirir, yoksa undefined. */
export function ddToSaved(
  results: readonly (DdResult | undefined)[] | undefined,
  count: number,
): Pick<NewSetInput, 'dd' | 'par'> | undefined {
  if (!results || results.length !== count || results.some((r) => !r)) return undefined
  const complete = results as DdResult[]
  return {
    dd: complete.map((r) => tricksToHex(r.tricks)),
    par: complete.map((r) => ({ score: r.par.score, contracts: [...r.par.contracts] })),
  }
}

/** Kayıtlı setteki çift kukla sonuçları (yoksa undefined). */
export function ddFromSaved(
  set: Pick<NewSetInput, 'dd' | 'par'>,
): (DdResult | undefined)[] | undefined {
  if (!set.dd || !set.par) return undefined
  return set.dd.map((hex, i) =>
    set.par?.[i] ? { tricks: tricksFromHex(hex), par: set.par[i] } : undefined,
  )
}

export function buildNewSet(params: {
  title: string
  notes: string
  topicId: string
  recipe: Recipe
  result: GenerateResult
  /** Tamamlanmış çift kukla sonuçları (eksikse kaydedilmez, set sayfası sonra hesaplar). */
  dd?: readonly (DdResult | undefined)[]
}): NewSetInput {
  const { title, notes, topicId, recipe, result } = params
  return {
    title: title.trim().slice(0, MAX_TITLE_LENGTH),
    topicId,
    topicName: recipe.name,
    recipe,
    seed: result.seed,
    count: result.deals.length,
    deals: result.deals.map(toSavedDeal),
    notes: notes.trim().slice(0, MAX_NOTES_LENGTH),
    ...ddToSaved(params.dd, result.deals.length),
  }
}

const dateFormat = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** Örn. "1 Sanzatu açılışı · 10.10.2026". */
export function defaultSetTitle(topicName: string, date: Date): string {
  return `${topicName} · ${dateFormat.format(date)}`
}
