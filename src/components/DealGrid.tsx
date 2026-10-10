import type { ReactNode } from 'react'
import type { DealView } from '../data/savedSet'
import { tr } from '../i18n/tr'
import { DealCard } from './DealCard'
import { dealCaption } from './format'

interface DealGridProps {
  deals: DealView[]
  focusOnly: boolean
  onOpen: (index: number) => void
  /** Başlığın yanında gösterilecek ek işaret (örn. "Not var"). */
  badge?: (deal: DealView) => ReactNode
}

/** Board kartları ızgarası; karta tıklayınca büyük görünüm açılır. */
export function DealGrid({ deals, focusOnly, onOpen, badge }: DealGridProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {deals.map((deal, index) => (
        <li key={deal.board}>
          <article
            onClick={() => onOpen(index)}
            className="flex h-full cursor-pointer flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-emerald-400 hover:shadow"
          >
            <header className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-medium text-slate-500">{dealCaption(deal)}</h3>
              <div className="flex items-center gap-1">
                {badge?.(deal)}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onOpen(index)
                  }}
                  className="rounded px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  {tr.board.open}
                </button>
              </div>
            </header>
            <DealCard deal={deal} focusOnly={focusOnly} />
          </article>
        </li>
      ))}
    </ul>
  )
}
