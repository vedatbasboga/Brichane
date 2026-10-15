import { describe, expect, it } from 'vitest'
import { signalText } from './signalText'

describe('signalText', () => {
  it('describes attitude and count with the card size', () => {
    expect(
      signalText({ signal: { kind: 'attitude', like: true, high: true }, status: 'given' }),
    ).toBe('Tutum: beğeniyor (büyük kart).')
    expect(
      signalText({ signal: { kind: 'count', even: false, high: false }, status: 'given' }),
    ).toBe('Sayı: tek sayıda kartı var (küçük kart).')
  })

  it('names the wanted suit for discards', () => {
    expect(
      signalText({
        signal: { kind: 'discard', method: 'roman', suit: 'D', card: 'lowEven' },
        status: 'given',
      }),
    ).toBe(
      'Defos (Roman): küçük çift sayı, bu rengi istemiyor; kalan renklerden düşüğünü (♦) istiyor.',
    )
    expect(
      signalText({
        signal: { kind: 'discard', method: 'lavinthal', suit: 'H', card: null },
        status: 'noCard',
      }),
    ).toBe('Defos (Lavinthal): ♥ istemek için uygun kart yok.')
  })

  it('says when double dummy overruled the signal', () => {
    expect(signalText({ signal: { kind: 'aceWins' }, status: 'dd' })).toMatch(/çift kuklanın kartı/)
  })
})
