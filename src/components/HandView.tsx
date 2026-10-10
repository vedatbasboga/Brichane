import { SUITS, SUIT_SYMBOLS, handBySuit, hcp, rankLabel, type Hand, type Seat } from '../engine'
import { tr } from '../i18n/tr'
import { SUIT_COLORS } from './suitColors'

interface HandViewProps {
  hand: Hand
  seat: Seat
  hidden?: boolean
  size?: 'sm' | 'lg'
}

export function HandView({ hand, seat, hidden = false, size = 'sm' }: HandViewProps) {
  const bySuit = handBySuit(hand)
  const large = size === 'lg'

  return (
    <div className={large ? 'text-lg leading-snug' : 'text-sm leading-tight'}>
      <div
        className={`mb-0.5 flex items-baseline gap-1.5 font-semibold text-slate-500 ${large ? 'text-sm' : 'text-xs'}`}
      >
        <span title={tr.seatNames[seat]}>{tr.seats[seat]}</span>
        {!hidden && (
          <span className="text-emerald-700">
            {hcp(hand)} {tr.hcp}
          </span>
        )}
      </div>
      {hidden ? (
        <div className="rounded border border-dashed border-slate-300 px-2 py-3 text-center text-xs text-slate-400">
          {tr.board.hidden}
        </div>
      ) : (
        SUITS.map((suit) => (
          <div key={suit} className="flex gap-1">
            <span className={`w-4 shrink-0 ${SUIT_COLORS[suit]}`}>{SUIT_SYMBOLS[suit]}</span>
            <span className="font-medium break-all text-slate-900">
              {bySuit[suit].map(rankLabel).join(' ') || '—'}
            </span>
          </div>
        ))
      )}
    </div>
  )
}
