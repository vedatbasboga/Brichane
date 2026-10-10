import { STRAIN_SYMBOLS, parseParContract, type DdPar, type Seat } from '../engine'
import { tr } from '../i18n/tr'

function seatsLabel(seats: readonly Seat[]): string {
  const key = seats.join('')
  if (key === 'NS' || key === 'EW') return tr.pairs[key]
  return seats.map((seat) => tr.seats[seat]).join('')
}

/** "5D*-EW-3" → "5♦x DB −3"; tanınmayan biçim olduğu gibi döner. */
export function formatParContract(raw: string): string {
  const c = parseParContract(raw)
  if (!c) return raw
  const result = c.result === 0 ? '' : ` ${c.result > 0 ? '+' : '−'}${Math.abs(c.result)}`
  return `${c.level}${STRAIN_SYMBOLS[c.strain]}${c.doubled ? 'x' : ''} ${seatsLabel(c.seats)}${result}`
}

/** Skoru kazanan taraf açısından yazar: 420 → "KG +420", −620 → "DB +620". */
export function formatParScore(score: number): string {
  if (score === 0) return '0'
  return score > 0 ? `${tr.pairs.NS} +${score}` : `${tr.pairs.EW} +${-score}`
}

/** Örn. "4♠ / 4♥ KG · KG +420". */
export function formatPar(par: DdPar): string {
  if (par.contracts.length === 0) return tr.dd.passOut
  return `${par.contracts.map(formatParContract).join(' / ')} · ${formatParScore(par.score)}`
}
