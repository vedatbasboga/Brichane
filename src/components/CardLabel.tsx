import { cardRank, cardSuit, rankLabel, type Card } from '../engine'
import { Suit } from './ui/Suit'
import { cx } from './ui/cx'

interface CardLabelProps {
  card: Card
  /** Kart kutusu olarak (ortadaki löve) ya da satır içi metin olarak. */
  boxed?: boolean
  winner?: boolean
}

/** Tek kart: renk sembolü + değer (örn. ♥Q, ♠10). */
export function CardLabel({ card, boxed = false, winner = false }: CardLabelProps) {
  const content = (
    <>
      <Suit suit={cardSuit(card)} size={boxed ? 14 : '0.95em'} />
      {rankLabel(cardRank(card))}
    </>
  )
  if (!boxed) return <span className="inline-flex items-baseline whitespace-nowrap">{content}</span>
  return <span className={cx('bh-card', winner && 'is-winner')}>{content}</span>
}
