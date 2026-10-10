import type { DealView } from '../data/savedSet'
import { tr } from '../i18n/tr'

/** Örn. "Board 3 · Dağıtıcı G · DB zon". */
export function dealCaption(deal: DealView): string {
  return `${tr.board.board} ${deal.board} · ${tr.board.dealer} ${tr.seats[deal.dealer]} · ${tr.vulnerability[deal.vul]}`
}
