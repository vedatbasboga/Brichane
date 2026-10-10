import type { KeyboardEvent, ReactNode } from 'react'
import type { DealView } from '../data/savedSet'
import { SEATS, controls, hcp, losingTrickCount, shapePattern, type DdResult } from '../engine'
import { tr } from '../i18n/tr'
import { DdTable } from './DdTable'
import { DealCard } from './DealCard'
import { dealCaption } from './format'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

interface DealDialogProps {
  deals: DealView[]
  index: number | null
  focusOnly: boolean
  onClose: () => void
  onNavigate: (index: number) => void
  /** Tablonun altına eklenecek içerik (örn. board notu). */
  renderExtra?: (deal: DealView) => ReactNode
  /** Çift kukla sonuçları (board sırasıyla); "sadece konu eli" açıkken gösterilmez. */
  dd?: (DdResult | undefined)[]
}

/** Seçili board'un büyük görünümü; ← → ile boardlar arasında gezilir. */
export function DealDialog({
  deals,
  index,
  focusOnly,
  onClose,
  onNavigate,
  renderExtra,
  dd,
}: DealDialogProps) {
  if (index === null || !deals[index]) return null
  const current = index
  const deal = deals[current]
  const hasPrev = current > 0
  const hasNext = current < deals.length - 1

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    // Yazı alanında oklar imleci taşır, board değiştirmez.
    const target = event.target as HTMLElement
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return
    if (event.key === 'ArrowLeft' && hasPrev) onNavigate(current - 1)
    if (event.key === 'ArrowRight' && hasNext) onNavigate(current + 1)
  }

  const visibleSeats = SEATS.filter((seat) => !focusOnly || deal.focusSeats.includes(seat))

  return (
    <Modal
      title={dealCaption(deal)}
      size="lg"
      onClose={onClose}
      onKeyDown={handleKeyDown}
      footer={
        <div className="flex w-full justify-between gap-2">
          <Button disabled={!hasPrev} onClick={() => onNavigate(current - 1)}>
            ← {tr.dealView.prev}
          </Button>
          <Button disabled={!hasNext} onClick={() => onNavigate(current + 1)}>
            {tr.dealView.next} →
          </Button>
        </div>
      }
    >
      <DealCard deal={deal} focusOnly={focusOnly} size="lg" />

      <table className="bh-dd-table bh-stats">
        <thead>
          <tr>
            <th scope="col">{tr.dealView.hand}</th>
            <th scope="col">{tr.hcp}</th>
            <th scope="col">{tr.dealView.shape}</th>
            <th scope="col">{tr.dealView.ltc}</th>
            <th scope="col">{tr.dealView.controls}</th>
          </tr>
        </thead>
        <tbody>
          {visibleSeats.map((seat) => (
            <tr key={seat}>
              <th scope="row">{tr.seatNames[seat]}</th>
              <td>{hcp(deal.hands[seat])}</td>
              <td>{shapePattern(deal.hands[seat])}</td>
              <td>{losingTrickCount(deal.hands[seat])}</td>
              <td>{controls(deal.hands[seat])}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {dd && !focusOnly && (
        <section className="flex flex-col gap-2">
          <h3 className="bh-heading">{tr.dd.title}</h3>
          <p className="text-ink-muted text-[13px] leading-[18px]">{tr.dd.help}</p>
          <div className="max-w-md">
            <DdTable result={dd[current]} size="lg" />
          </div>
        </section>
      )}

      {renderExtra?.(deal)}
    </Modal>
  )
}
