import type { ReactNode } from 'react'
import type { DealView } from '../data/savedSet'
import type { DdResult } from '../engine'
import { tr } from '../i18n/tr'
import { DdTable } from './DdTable'
import { DealCard } from './DealCard'
import { dealCaption } from './format'

interface DealGridProps {
  deals: DealView[]
  focusOnly: boolean
  onOpen: (index: number) => void
  /** Başlığın yanında gösterilecek ek işaret (örn. "Not var"). */
  badge?: (deal: DealView) => ReactNode
  /** Çift kukla sonuçları (board sırasıyla); verilirse kartın altında gösterilir. */
  dd?: (DdResult | undefined)[]
}

/** Board kartları ızgarası; telefonda tek sütun, genişte 2–4. Karta tıklayınca büyük görünüm. */
export function DealGrid({ deals, focusOnly, onOpen, badge, dd }: DealGridProps) {
  return (
    <ul className="bh-board-grid">
      {deals.map((deal, index) => (
        <li key={deal.board}>
          <article
            className="bh-board is-clickable"
            tabIndex={0}
            onClick={() => onOpen(index)}
            onKeyDown={(event) => event.key === 'Enter' && onOpen(index)}
          >
            <div className="bh-board-head">
              <span className="bh-board-title">{dealCaption(deal)}</span>
              <span className="bh-board-head-end">
                {badge?.(deal)}
                <span className="bh-board-open" aria-hidden="true">
                  {tr.board.open}
                </span>
              </span>
            </div>
            <DealCard deal={deal} focusOnly={focusOnly} />
            {dd && !focusOnly && (
              <div className="bh-board-dd">
                <DdTable result={dd[index]} />
              </div>
            )}
          </article>
        </li>
      ))}
    </ul>
  )
}
