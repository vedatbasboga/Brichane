import type { Suit as SuitCode } from '../../engine'
import { tr } from '../../i18n/tr'
import { CLUB_STEM_PATH, DIAMOND_PATH, HEART_PATH, SPADE_PATH } from './paths'
import { cx } from './cx'

interface SuitProps {
  suit: SuitCode
  size?: number | string
  className?: string
}

/** Renk sembolü (yazı tipi karakteri yerine her cihazda aynı çizim). */
export function Suit({ suit, size = '1em', className = '' }: SuitProps) {
  const red = suit === 'H' || suit === 'D'
  return (
    <svg
      className={cx('bh-suit', red ? 'bh-suit-red' : 'bh-suit-black', className)}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-label={tr.suitNames[suit]}
      focusable="false"
    >
      <g fill="currentColor">
        {suit === 'S' && <path d={SPADE_PATH} />}
        {suit === 'H' && <path d={HEART_PATH} />}
        {suit === 'D' && <path d={DIAMOND_PATH} />}
        {suit === 'C' && (
          <>
            <circle cx={12} cy={7.2} r={4.3} />
            <circle cx={7.2} cy={13.4} r={4.3} />
            <circle cx={16.8} cy={13.4} r={4.3} />
            <circle cx={12} cy={12} r={2.6} />
            <path d={CLUB_STEM_PATH} />
          </>
        )}
      </g>
    </svg>
  )
}
