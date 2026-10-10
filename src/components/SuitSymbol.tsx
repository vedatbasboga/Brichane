import { SUIT_SYMBOLS, type Suit } from '../engine'
import { tr } from '../i18n/tr'
import { SUIT_COLORS } from './suitColors'

export function SuitSymbol({ suit, className = '' }: { suit: Suit; className?: string }) {
  return (
    <span className={`${SUIT_COLORS[suit]} ${className}`} title={tr.suitNames[suit]}>
      {SUIT_SYMBOLS[suit]}
    </span>
  )
}
