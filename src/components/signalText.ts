import { SUIT_SYMBOLS, type SignalNote } from '../engine'
import { tr } from '../i18n/tr'

/** Apel kartının açıklaması, örn. "Sayı: çift sayıda kartı var (büyük kart)." */
export function signalText({ signal, status }: SignalNote): string {
  const s = tr.signals
  const card = (high: boolean) => (high ? s.highCard : s.lowCard)
  const blocked = status === 'dd' ? ` ${s.blocked}` : ''
  switch (signal.kind) {
    case 'attitude':
      return s.attitude(signal.like, card(signal.high)) + blocked
    case 'count':
      return s.count(signal.even, card(signal.high)) + blocked
    case 'suitPreference':
      return s.suitPreference(SUIT_SYMBOLS[signal.suit], card(signal.high)) + blocked
    case 'discard': {
      const head = signal.method === 'roman' ? s.roman : s.lavinthal
      const suit = SUIT_SYMBOLS[signal.suit]
      if (signal.card) return `${head}: ${s.discard[signal.card](suit)}`
      if (status === 'noCard') return `${head}: ${s.discard.none(suit)}`
      return `${head}: ${s.discard.wanted(suit)}${blocked}`
    }
    case 'return':
      return (signal.remaining === 2 ? s.returnTwo : s.returnMore(signal.remaining)) + blocked
    case 'aceWins':
      return s.aceWins + blocked
  }
}
