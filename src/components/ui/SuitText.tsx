import { Fragment } from 'react'
import type { Suit as SuitCode } from '../../engine'
import { Suit } from './Suit'

const GLYPHS: Record<string, SuitCode> = { '♠': 'S', '♥': 'H', '♦': 'D', '♣': 'C' }

/** Metindeki ♠ ♥ ♦ ♣ karakterlerini Suit çizimine çevirir ("4♠ NS", "5+ ♥ veya ♠"). */
export function SuitText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/([♠♥♦♣])/)
        .map((part, i) =>
          GLYPHS[part] ? <Suit key={i} suit={GLYPHS[part]} /> : <Fragment key={i}>{part}</Fragment>,
        )}
    </>
  )
}
