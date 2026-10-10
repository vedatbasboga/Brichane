import { useEffect, useRef, type ReactNode } from 'react'
import type { DealView } from '../data/savedSet'
import { SEATS, controls, hcp, losingTrickCount, shapePattern } from '../engine'
import { tr } from '../i18n/tr'
import { DealCard } from './DealCard'
import { dealCaption } from './format'

interface DealDialogProps {
  deals: DealView[]
  index: number | null
  focusOnly: boolean
  onClose: () => void
  onNavigate: (index: number) => void
  /** Tablonun altına eklenecek içerik (örn. board notu). */
  renderExtra?: (deal: DealView) => ReactNode
}

/** Seçili board'un büyük görünümü; ← → ile boardlar arasında gezilir. */
export function DealDialog({
  deals,
  index,
  focusOnly,
  onClose,
  onNavigate,
  renderExtra,
}: DealDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const deal = index === null ? null : deals[index]

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (deal && !dialog.open) dialog.showModal()
    if (!deal && dialog.open) dialog.close()
  }, [deal])

  const hasPrev = index !== null && index > 0
  const hasNext = index !== null && index < deals.length - 1

  function handleKeyDown(event: React.KeyboardEvent) {
    if (index === null) return
    // Yazı alanında oklar imleci taşır, board değiştirmez.
    const target = event.target as HTMLElement
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return
    if (event.key === 'ArrowLeft' && hasPrev) onNavigate(index - 1)
    if (event.key === 'ArrowRight' && hasNext) onNavigate(index + 1)
  }

  const visibleSeats = deal
    ? SEATS.filter((seat) => !focusOnly || deal.focusSeats.includes(seat))
    : []

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      className="m-auto max-h-[calc(100dvh-1rem)] w-[min(44rem,calc(100vw-1rem))] rounded-xl bg-white p-0 shadow-xl backdrop:bg-slate-900/60"
    >
      {deal && index !== null && (
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{dealCaption(deal)}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {tr.dealView.close}
            </button>
          </div>

          <DealCard deal={deal} focusOnly={focusOnly} size="lg" />

          {visibleSeats.length > 0 && (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-1 font-medium">{tr.dealView.hand}</th>
                  <th className="py-1 font-medium">{tr.hcp}</th>
                  <th className="py-1 font-medium">{tr.dealView.shape}</th>
                  <th className="py-1 font-medium">{tr.dealView.ltc}</th>
                  <th className="py-1 font-medium">{tr.dealView.controls}</th>
                </tr>
              </thead>
              <tbody className="text-slate-900">
                {visibleSeats.map((seat) => (
                  <tr key={seat} className="border-t border-slate-100">
                    <td className="py-1">{tr.seatNames[seat]}</td>
                    <td className="py-1">{hcp(deal.hands[seat])}</td>
                    <td className="py-1">{shapePattern(deal.hands[seat])}</td>
                    <td className="py-1">{losingTrickCount(deal.hands[seat])}</td>
                    <td className="py-1">{controls(deal.hands[seat])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {renderExtra?.(deal)}

          <div className="flex justify-between gap-2">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => onNavigate(index - 1)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              ← {tr.dealView.prev}
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => onNavigate(index + 1)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              {tr.dealView.next} →
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
