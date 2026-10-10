// PBN dışa aktarma (Bridge Composer, BBO, kart dağıtma makineleri).
// PBN 2.1 etiketleri + Bridge Composer'ın çift kukla etiketleri. Saf fonksiyon; indirme ayrı.

import type { DealView } from '../data/savedSet'
import {
  dealToPbn,
  parseParContract,
  tricksToHex,
  type DdPar,
  type DdResult,
  type Seat,
  type Strain,
} from '../engine'

export interface PbnExportOptions {
  /** `Event` etiketi: set adı ya da konu adı. */
  event: string
  date: Date
  deals: DealView[]
  /** Board sırasıyla çift kukla sonuçları; olmayan board'lar için etiket yazılmaz. */
  dd?: (DdResult | undefined)[]
  /** Setin genel notu (dosyanın başında yorum olarak). */
  notes?: string
  /** Board numarası → not. */
  boardNotes?: Record<number, string>
  /** Dosyanın başına yazılan kaynak bağlantısı. */
  sourceUrl?: string
}

const NL = '\r\n'
const PBN_STRAIN: Record<Strain, string> = { N: 'NT', S: 'S', H: 'H', D: 'D', C: 'C' }
const RESULT_TABLE_SEATS: readonly Seat[] = ['N', 'S', 'E', 'W']
const RESULT_TABLE_STRAINS: readonly Strain[] = ['N', 'S', 'H', 'D', 'C']

export function buildPbnFile(options: PbnExportOptions): string {
  const lines: string[] = [
    '% PBN 2.1',
    '% EXPORT',
    `% Briçhane${options.sourceUrl ? ` — ${options.sourceUrl}` : ''}`,
  ]
  if (options.notes?.trim()) lines.push(...comment(options.notes))
  lines.push('')

  options.deals.forEach((deal, i) => {
    lines.push(...boardSection(deal, options, options.dd?.[i]), '')
  })
  return lines.join(NL)
}

function boardSection(
  deal: DealView,
  options: PbnExportOptions,
  dd: DdResult | undefined,
): string[] {
  const lines = [
    tag('Event', options.event),
    tag('Site', ''),
    tag('Date', pbnDate(options.date)),
    tag('Board', String(deal.board)),
    tag('West', ''),
    tag('North', ''),
    tag('East', ''),
    tag('South', ''),
    tag('Dealer', deal.dealer),
    tag('Vulnerable', deal.vul),
    tag('Deal', dealToPbn(deal.hands, deal.dealer)),
    tag('Scoring', ''),
    tag('Declarer', ''),
    tag('Contract', ''),
    tag('Result', ''),
  ]
  if (dd) {
    lines.push(tag('DoubleDummyTricks', tricksToHex(dd.tricks)))
    lines.push(tag('OptimumScore', optimumScore(dd.par.score)))
    const par = parContract(dd.par)
    if (par) lines.push(tag('ParContract', par))
    // Standarttaki sütun biçimi tek ters eğik çizgiyle yazılır; kaçış uygulanmaz.
    lines.push('[OptimumResultTable "Declarer;Denomination\\2R;Result\\2R"]')
    for (const seat of RESULT_TABLE_SEATS) {
      for (const strain of RESULT_TABLE_STRAINS) {
        lines.push(`${seat} ${PBN_STRAIN[strain]} ${dd.tricks[seat][strain]}`)
      }
    }
  }
  const note = options.boardNotes?.[deal.board]
  if (note?.trim()) lines.push(...comment(note))
  return lines
}

function tag(name: string, value: string): string {
  return `[${name} "${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`
}

/** PBN yorumu; `}` yorum içinde kullanılamaz, satırlar korunur. */
function comment(text: string): string[] {
  const body = text.trim().replace(/[{}]/g, (ch) => (ch === '{' ? '(' : ')'))
  const rows = body.split(/\r?\n/)
  if (rows.length === 1) return [`{${rows[0]}}`]
  return [`{${rows[0]}`, ...rows.slice(1, -1), `${rows[rows.length - 1]}}`]
}

function pbnDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

/** Skoru kazanan taraf açısından: 420 → "NS 420", −620 → "EW 620". */
export function optimumScore(score: number): string {
  return score < 0 ? `EW ${-score}` : `NS ${score}`
}

/**
 * İlk par kontratı PBN biçiminde: "1S-NS+2" → "NS 3S", "5D*-EW-3" → "EW 5DX".
 * Fazla löveli kontrat aynı skoru veren seviyeye çevrilir. Par yoksa (pas) null.
 */
export function parContract(par: DdPar): string | null {
  const first = par.contracts[0]
  const c = first ? parseParContract(first) : null
  if (!c) return null
  const level = c.result > 0 ? c.level + c.result : c.level
  return `${c.seats.join('')} ${level}${PBN_STRAIN[c.strain]}${c.doubled ? 'X' : ''}`
}
