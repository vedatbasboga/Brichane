import type { DealView } from '../data/savedSet'
import { STRAIN_SYMBOLS, type PlayContract } from '../engine'
import { tr } from '../i18n/tr'

/** Örn. "Board 3 · Dealer G · DB zon". */
export function dealCaption(deal: DealView): string {
  return `${tr.board.board} ${deal.board} · ${tr.board.dealer} ${tr.seats[deal.dealer]} · ${tr.vulnerability[deal.vul]}`
}

/** Örn. "2NT", "4♠". */
export function contractLabel(contract: PlayContract): string {
  return `${contract.level}${STRAIN_SYMBOLS[contract.strain]}`
}
