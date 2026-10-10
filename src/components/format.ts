import type { GeneratedDeal } from '../engine'
import { tr } from '../i18n/tr'

/** Örn. "Board 3 · Dağıtıcı G · DB zon". */
export function dealCaption(deal: GeneratedDeal): string {
  return `${tr.board.board} ${deal.board} · ${tr.board.dealer} ${tr.seats[deal.dealer]} · ${tr.vulnerability[deal.vul]}`
}
