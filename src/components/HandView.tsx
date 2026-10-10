import { SUITS, handBySuit, hcp, rankLabel, type Hand, type Seat } from '../engine'
import { tr } from '../i18n/tr'
import { Suit } from './ui/Suit'
import { cx } from './ui/cx'

interface HandViewProps {
  hand: Hand
  seat: Seat
  hidden?: boolean
  size?: 'sm' | 'lg'
}

/** Bir oyuncunun eli: koltuk harfi ve HP, altında ♠ ♥ ♦ ♣ satırları. */
export function HandView({ hand, seat, hidden = false, size = 'sm' }: HandViewProps) {
  const large = size === 'lg'
  const head = (
    <div className="bh-hand-head">
      <span className="bh-hand-seat" title={tr.seatNames[seat]}>
        {tr.seats[seat]}
      </span>
      {!hidden && (
        <span className="bh-hand-hp">
          {hcp(hand)} {tr.hcp}
        </span>
      )}
    </div>
  )

  if (hidden) {
    return (
      <div className={cx('bh-hand', large && 'bh-hand-lg')}>
        {head}
        <div className="bh-hand-hidden">{tr.board.hidden}</div>
      </div>
    )
  }

  const bySuit = handBySuit(hand)
  return (
    <div className={cx('bh-hand', large && 'bh-hand-lg')} aria-label={tr.seatNames[seat]}>
      {head}
      {SUITS.map((suit) => {
        const cards = bySuit[suit].map(rankLabel).join(' ')
        return (
          <div key={suit} className="bh-hand-row">
            <Suit suit={suit} size={large ? 16 : 13} />
            <span className={`bh-hand-cards${cards ? '' : 'is-void'}`}>{cards || '—'}</span>
          </div>
        )
      })}
    </div>
  )
}
