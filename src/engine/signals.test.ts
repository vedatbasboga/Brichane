import { describe, expect, it } from 'vitest'
import { RANK_CHARS, makeCard, type Card, type Deal, type Seat, type Suit } from './cards'
import type { Strain } from './dd'
import { parsePbnHand } from './pbn'
import type { PlayedCard } from './play'
import { defenderSignal, preferredSuit, type Carding, type DefenseContext } from './signals'

const STANDARD: Carding = { signals: 'standard', discards: 'roman' }
const UDCA: Carding = { signals: 'udca', discards: 'roman' }
const LAVINTHAL: Carding = { signals: 'standard', discards: 'lavinthal' }

/** "♠A" gibi: c('S', 'A'). */
function c(suit: Suit, rank: string): Card {
  return makeCard(suit, RANK_CHARS.indexOf(rank))
}

/** Eller PBN el biçiminde (♠.♥.♦.♣); yalnızca konuyla ilgili kartlar yazılır. */
function deal(hands: Record<Seat, string>): Deal {
  return {
    N: parsePbnHand(hands.N),
    E: parsePbnHand(hands.E),
    S: parsePbnHand(hands.S),
    W: parsePbnHand(hands.W),
  }
}

function context(
  start: Deal,
  history: PlayedCard[],
  seat: Seat,
  strain: Strain,
  declarer: Seat = 'S',
): DefenseContext {
  const played = new Set(history.map((p) => p.card))
  const hands = {} as Deal
  for (const s of ['N', 'E', 'S', 'W'] as const) hands[s] = start[s].filter((x) => !played.has(x))
  return { deal: start, hands, declarer, strain, history, seat }
}

/** Sıradaki oyuncunun elindeki bütün kartlar (renge uyma kuralıyla). */
function legalCards(ctx: DefenseContext): Card[] {
  const hand = ctx.hands[ctx.seat]
  const trickStart = ctx.history.length - (ctx.history.length % 4)
  const lead = ctx.history[trickStart]
  if (!lead || trickStart === ctx.history.length) return hand
  const led = Math.floor(lead.card / 13)
  const follow = hand.filter((x) => Math.floor(x / 13) === led)
  return follow.length ? follow : hand
}

function signal(ctx: DefenseContext, carding: Carding, optimal?: Card[]) {
  const legal = legalCards(ctx)
  return defenderSignal(ctx, optimal ?? legal, legal, carding)
}

describe('attitude against NT (As veya Dam çıkışı)', () => {
  const play = (east: string) =>
    context(
      deal({ N: '762...', E: east, S: 'T9...', W: 'AKJ54...' }),
      [
        { seat: 'W', card: c('S', 'A') },
        { seat: 'N', card: c('S', '2') },
      ],
      'E',
      'N',
    )

  it('encourages with the Queen: high card (standard), low card (UDCA)', () => {
    const ctx = play('Q83...')
    expect(signal(ctx, STANDARD)).toEqual({
      note: { signal: { kind: 'attitude', like: true, high: true }, status: 'given' },
      card: c('S', '8'),
    })
    expect(signal(ctx, UDCA)?.card).toBe(c('S', '3'))
  })

  it('discourages without an honour', () => {
    const ctx = context(
      deal({ N: '762...', E: '983...', S: 'QT...', W: 'AKJ54...' }),
      [
        { seat: 'W', card: c('S', 'A') },
        { seat: 'N', card: c('S', '2') },
      ],
      'E',
      'N',
    )
    expect(signal(ctx, STANDARD)?.note.signal).toEqual({
      kind: 'attitude',
      like: false,
      high: false,
    })
    expect(signal(ctx, STANDARD)?.card).toBe(c('S', '3'))
    expect(signal(ctx, UDCA)?.card).toBe(c('S', '9'))
  })

  it('also signals attitude to a Queen lead', () => {
    const ctx = context(
      deal({ N: '762...', E: 'K83...', S: 'A9...', W: 'QJT54...' }),
      [
        { seat: 'W', card: c('S', 'Q') },
        { seat: 'N', card: c('S', '2') },
      ],
      'E',
      'N',
    )
    expect(signal(ctx, STANDARD)?.note.signal.kind).toBe('attitude')
  })

  it('gives count, not attitude, to a King lead', () => {
    const ctx = context(
      deal({ N: '762...', E: '983...', S: 'AT...', W: 'KQJ54...' }),
      [
        { seat: 'W', card: c('S', 'K') },
        { seat: 'N', card: c('S', '2') },
      ],
      'E',
      'N',
    )
    expect(signal(ctx, STANDARD)?.note.signal).toEqual({ kind: 'count', even: false, high: false })
  })

  it('marks the signal as blocked when only the other card keeps the result', () => {
    const ctx = play('Q83...')
    expect(signal(ctx, STANDARD, [c('S', '3')])).toEqual({
      note: { signal: { kind: 'attitude', like: true, high: true }, status: 'dd' },
      card: null,
    })
  })
})

describe('small lead against NT (rua)', () => {
  const ctx = context(
    deal({ N: '762...', E: 'A93...', S: 'QT...', W: 'KJ854...' }),
    [
      { seat: 'W', card: c('S', '5') },
      { seat: 'N', card: c('S', '2') },
    ],
    'E',
    'N',
  )

  it('wins with the Ace', () => {
    expect(signal(ctx, STANDARD)).toEqual({
      note: { signal: { kind: 'aceWins' }, status: 'given' },
      card: c('S', 'A'),
    })
  })

  it('leaves the card to double dummy when the Ace costs a trick', () => {
    expect(signal(ctx, STANDARD, [c('S', '3')])?.card).toBeNull()
  })
})

describe('count', () => {
  // Löve 1: W ♠5, yer ♠K ile alır; löve 2: yer ♥2 çıkar, E ikinci elde.
  const ctx = (east: string) =>
    context(
      deal({ N: 'K2.2..', E: '3.' + east + '..', S: '4.AKQ..', W: '5...' }),
      [
        { seat: 'W', card: c('S', '5') },
        { seat: 'N', card: c('S', 'K') },
        { seat: 'E', card: c('S', '3') },
        { seat: 'S', card: c('S', '4') },
        { seat: 'N', card: c('H', '2') },
      ],
      'E',
      'N',
    )

  it('starts high from an even number of cards (standard)', () => {
    expect(signal(ctx('86'), STANDARD)).toEqual({
      note: { signal: { kind: 'count', even: true, high: true }, status: 'given' },
      card: c('H', '8'),
    })
    expect(signal(ctx('86'), UDCA)?.card).toBe(c('H', '6'))
  })

  it('starts low from an odd number of cards (standard)', () => {
    expect(signal(ctx('863'), STANDARD)?.card).toBe(c('H', '3'))
    expect(signal(ctx('863'), UDCA)?.card).toBe(c('H', '8'))
  })

  it('signals only with the first card of a suit', () => {
    // Löve 2: E ♥8 ile sayı verdi. Löve 3: S ♥K çıkar, W defos, yer ♥3; E yine ♥ oynuyor.
    const later = context(
      deal({ N: 'K2.32..', E: '3.864..', S: '4.AK..', W: '5.T.2.' }),
      [
        { seat: 'W', card: c('S', '5') },
        { seat: 'N', card: c('S', 'K') },
        { seat: 'E', card: c('S', '3') },
        { seat: 'S', card: c('S', '4') },
        { seat: 'N', card: c('H', '2') },
        { seat: 'E', card: c('H', '8') },
        { seat: 'S', card: c('H', 'A') },
        { seat: 'W', card: c('H', 'T') },
        { seat: 'S', card: c('H', 'K') },
        { seat: 'W', card: c('D', '2') },
        { seat: 'N', card: c('H', '3') },
      ],
      'E',
      'N',
    )
    expect(signal(later, STANDARD)).toBeNull()
  })

  it('does not signal for declarer’s side', () => {
    const declarerSide = { ...ctx('86'), seat: 'N' as const }
    expect(defenderSignal(declarerSide, [c('H', '2')], [c('H', '2')], STANDARD)).toBeNull()
  })
})

describe('against a trump contract', () => {
  const aceLead = (north: string, east: string) =>
    context(
      deal({ N: '.' + north + '..', E: '.' + east + '.A2.43', S: '.Q..', W: '.AK4..' }),
      [
        { seat: 'W', card: c('H', 'A') },
        { seat: 'N', card: c('H', north.slice(-1)) },
      ],
      'E',
      'S',
    )

  it('gives count to the Ace lead', () => {
    expect(signal(aceLead('J752', '98'), STANDARD)?.note.signal).toEqual({
      kind: 'count',
      even: true,
      high: true,
    })
  })

  it('gives attitude when dummy has three small cards', () => {
    expect(signal(aceLead('752', 'J963'), STANDARD)?.note.signal).toEqual({
      kind: 'attitude',
      like: false,
      high: false,
    })
  })

  it('gives suit preference when dummy will ruff (singleton)', () => {
    // E'nin girişi ♦A: ♦, ♣'tan yüksek → büyük kart.
    expect(signal(aceLead('7', 'J963'), STANDARD)).toEqual({
      note: { signal: { kind: 'suitPreference', suit: 'D', high: true }, status: 'given' },
      card: c('H', '9'),
    })
  })

  it('shows suit preference while giving partner a ruff', () => {
    // Löve 1: W tek ♥4 ile çıkar, E Asla alır; E rengi çaktırır, girişi ♣A (düşük renk).
    const ctx = context(
      deal({ N: '.3..', E: '.AQ962.87.A43', S: '.5..', W: '32.4..' }),
      [
        { seat: 'W', card: c('H', '4') },
        { seat: 'N', card: c('H', '3') },
        { seat: 'E', card: c('H', 'A') },
        { seat: 'S', card: c('H', '5') },
      ],
      'E',
      'S',
    )
    expect(signal(ctx, STANDARD)).toEqual({
      note: { signal: { kind: 'suitPreference', suit: 'C', high: false }, status: 'given' },
      card: c('H', '2'),
    })
  })
})

describe('returning partner’s suit by count', () => {
  const afterAce = (east: string) =>
    context(
      deal({ N: '742.A..', E: east + '.2..', S: 'Q8.K..', W: 'KJT5...' }),
      [
        { seat: 'W', card: c('S', '5') },
        { seat: 'N', card: c('S', '2') },
        { seat: 'E', card: c('S', 'A') },
        { seat: 'S', card: c('S', '8') },
      ],
      'E',
      'N',
    )

  it('returns the higher of two remaining cards', () => {
    expect(signal(afterAce('A93'), STANDARD)).toEqual({
      note: { signal: { kind: 'return', remaining: 2 }, status: 'given' },
      card: c('S', '9'),
    })
  })

  it('returns the original fourth best with three or more cards', () => {
    expect(signal(afterAce('A963'), STANDARD)?.card).toBe(c('S', '3'))
  })
})

describe('discards', () => {
  // Sanzatu: yer ♣ akıtıyor, E'de ♣ yok; E ♥ istiyor (♥KQ).
  const ntDiscard = () =>
    context(
      deal({ N: '...AKQJ2', E: '862.KQ73.94.', S: '...3', W: '...4' }),
      [{ seat: 'N', card: c('C', 'A') }],
      'E',
      'N',
    )

  it('Roman: odd card in the wanted suit', () => {
    expect(signal(ntDiscard(), STANDARD)).toEqual({
      note: {
        signal: { kind: 'discard', method: 'roman', suit: 'H', card: 'odd' },
        status: 'given',
      },
      card: c('H', '3'),
    })
  })

  it('Roman: an even card from another suit points to the lower or higher remaining suit', () => {
    const optimal = [c('S', '8'), c('S', '6'), c('S', '2'), c('D', '9'), c('D', '4')]
    // ♠ atılırsa kalan ♥ ♦: ♥ büyüğü → büyük çift ♠8.
    expect(signal(ntDiscard(), STANDARD, optimal)?.card).toBe(c('S', '8'))
    // ♦ atılırsa kalan ♠ ♥: ♥ düşüğü → küçük çift ♦4.
    expect(signal(ntDiscard(), STANDARD, [c('D', '9'), c('D', '4')])).toEqual({
      note: {
        signal: { kind: 'discard', method: 'roman', suit: 'H', card: 'lowEven' },
        status: 'given',
      },
      card: c('D', '4'),
    })
  })

  it('Roman: reports when no card shows the wanted suit', () => {
    expect(signal(ntDiscard(), STANDARD, [c('D', '9')])?.note.status).toBe('dd')
  })

  it('Lavinthal in NT: the discarded suit is left out, the other two are ranked', () => {
    expect(signal(ntDiscard(), LAVINTHAL)?.card).toBe(c('S', '8'))
    expect(signal(ntDiscard(), LAVINTHAL, [c('D', '9'), c('D', '4')])?.note.signal).toEqual({
      kind: 'discard',
      method: 'lavinthal',
      suit: 'H',
      card: 'low',
    })
  })

  it('Lavinthal, trump ♥ and ♣ led: a small ♠ or ♦ asks for ♦ (hocanın örneği)', () => {
    const ctx = context(
      deal({ N: '...AK', E: '93.2.KQ5.', S: '...2', W: '...3' }),
      [{ seat: 'N', card: c('C', 'A') }],
      'E',
      'H',
    )
    expect(signal(ctx, LAVINTHAL)).toEqual({
      note: {
        signal: { kind: 'discard', method: 'lavinthal', suit: 'D', card: 'low' },
        status: 'given',
      },
      card: c('S', '3'),
    })
  })

  it('Lavinthal, trump ♦ and ♠ led: a big ♥ or ♣ asks for ♥ (hocanın örneği)', () => {
    const ctx = context(
      deal({ N: 'AK...', E: '.A84.2.92', S: '2...', W: '3...' }),
      [{ seat: 'N', card: c('S', 'A') }],
      'E',
      'D',
    )
    expect(signal(ctx, LAVINTHAL)?.card).toBe(c('C', '9'))
  })

  it('signals with the first discard only', () => {
    const ctx = context(
      deal({ N: '...AKQ', E: '862.KQ73.94.', S: '...32', W: '...54' }),
      [
        { seat: 'N', card: c('C', 'A') },
        { seat: 'E', card: c('H', '3') },
        { seat: 'S', card: c('C', '2') },
        { seat: 'W', card: c('C', '4') },
        { seat: 'N', card: c('C', 'K') },
      ],
      'E',
      'N',
    )
    expect(signal(ctx, STANDARD)).toBeNull()
  })

  it('does not signal when ruffing', () => {
    const ctx = context(
      deal({ N: '...AK', E: '3.2.KQ5.', S: '...2', W: '...3' }),
      [{ seat: 'N', card: c('C', 'A') }],
      'E',
      'H',
    )
    expect(signal(ctx, LAVINTHAL, [c('H', '2')])).toBeNull()
  })
})

describe('preferredSuit', () => {
  it('picks the suit with most points, then length, and none without honours', () => {
    const hand = parsePbnHand('K32.Q7654.A.98')
    expect(preferredSuit(hand, ['S', 'H', 'D'])).toBe('D')
    expect(preferredSuit(hand, ['S', 'H'])).toBe('S')
    expect(preferredSuit(parsePbnHand('Q2.Q7654..98'), ['S', 'H'])).toBe('H')
    expect(preferredSuit(hand, ['C'])).toBeNull()
  })
})
