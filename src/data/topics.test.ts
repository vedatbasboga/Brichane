import { describe, expect, it } from 'vitest'
import {
  SUITS,
  controls,
  generateDeals,
  hcp,
  losingTrickCount,
  rotateSeat,
  shapeClass,
  suitHcp,
  suitLengths,
  type Deal,
  type GeneratedDeal,
  type Hand,
  type Suit,
} from '../engine'
import { DEFAULT_TOPICS, groupByCategory } from './topics'

describe('DEFAULT_TOPICS', () => {
  it('has unique ids', () => {
    const ids = DEFAULT_TOPICS.map((topic) => topic.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(DEFAULT_TOPICS.map((topic) => [topic.name, topic] as const))(
    '%s produces 16 deals spread over all four seats',
    (_, topic) => {
      const result = generateDeals({ recipe: topic, count: 16, seed: topic.id })
      expect(result.status).toBe('ok')
      const dealers = result.deals.map((deal) => deal.dealer)
      for (const seat of ['N', 'E', 'S', 'W'] as const) {
        expect(dealers.filter((dealer) => dealer === seat)).toHaveLength(4)
      }
    },
  )

  it('minor opening hands are opening strength without a 5-card major or a NT opening', () => {
    const minor = DEFAULT_TOPICS.find((topic) => topic.id === '1-minor-opening')!
    const { deals } = generateDeals({ recipe: minor, count: 200, seed: 'minor' })
    for (const deal of deals) {
      const opener = deal.hands[deal.dealer]
      const points = hcp(opener)
      const lengths = suitLengths(opener)
      expect(points).toBeGreaterThanOrEqual(12)
      expect(points).toBeLessThanOrEqual(21)
      expect(lengths.S).toBeLessThanOrEqual(4)
      expect(lengths.H).toBeLessThanOrEqual(4)
      expect(Math.max(lengths.D, lengths.C)).toBeGreaterThanOrEqual(3)
      const balanced = shapeClass(opener) === 'balanced'
      expect(balanced && points >= 15 && points <= 17).toBe(false)
      expect(balanced && points >= 20).toBe(false)
    }
  })
})

/** Elin açacağı renk: en uzun, eşitlikte yüksek renk (motordan bağımsız hesap). */
function openingSuit(hand: Hand): Suit {
  const lengths = suitLengths(hand)
  return SUITS.reduce((best, suit) => (lengths[suit] > lengths[best] ? suit : best))
}

describe('competitive topics use the suit the opponent actually opens', () => {
  it('takeout doubler is short in the opened suit', () => {
    const topic = DEFAULT_TOPICS.find((t) => t.id === 'takeout-double')!
    const { deals } = generateDeals({ recipe: topic, count: 200, seed: 'takeout' })
    for (const deal of deals) {
      const opener = deal.hands[deal.dealer]
      const doubler = deal.hands[rotateSeat(deal.dealer, 1)]
      const opened = openingSuit(opener)
      expect(suitLengths(opener)[opened]).toBeGreaterThanOrEqual(5)
      expect(suitLengths(doubler)[opened]).toBeLessThanOrEqual(1)
      expect(hcp(doubler)).toBeGreaterThanOrEqual(12)
    }
  })

  it('overcaller has a 5+ suit other than the opened suit', () => {
    const topic = DEFAULT_TOPICS.find((t) => t.id === 'overcall')!
    const { deals } = generateDeals({ recipe: topic, count: 200, seed: 'overcall' })
    for (const deal of deals) {
      const opened = openingSuit(deal.hands[deal.dealer])
      const lengths = suitLengths(deal.hands[rotateSeat(deal.dealer, 1)])
      expect(lengths[opened]).toBeLessThanOrEqual(3)
      expect(SUITS.some((suit) => suit !== opened && lengths[suit] >= 5)).toBe(true)
    }
  })
})

describe('conventions after the opening', () => {
  it('Lebensohl (basic): 1NT, a 2♦/2♥/2♠ overcall; responder has a 6-card suit, weak or game-forcing', () => {
    const topic = DEFAULT_TOPICS.find((t) => t.id === 'lebensohl')!
    const { deals } = generateDeals({ recipe: topic, count: 200, seed: 'lebensohl' })
    for (const deal of deals) {
      const opener = deal.hands[deal.dealer]
      const overcaller = deal.hands[rotateSeat(deal.dealer, 1)]
      const responder = deal.hands[rotateSeat(deal.dealer, 2)]
      expect(hcp(opener)).toBeGreaterThanOrEqual(15)
      expect(hcp(opener)).toBeLessThanOrEqual(17)
      expect(shapeClass(opener)).toBe('balanced')
      const overcalled = openingSuit(overcaller)
      expect(overcalled).not.toBe('C')
      expect(suitLengths(overcaller)[overcalled]).toBeGreaterThanOrEqual(5)
      expect(hcp(overcaller)).toBeGreaterThanOrEqual(8)
      expect(hcp(overcaller)).toBeLessThanOrEqual(15)
      const lengths = suitLengths(responder)
      const points = hcp(responder)
      expect(Math.max(...Object.values(lengths))).toBeGreaterThanOrEqual(6)
      expect(lengths[overcalled]).toBeLessThanOrEqual(2)
      expect(points <= 7 || (points >= 10 && points <= 15)).toBe(true)
    }
  })

  it('Check Back Stayman (basic): 1m – 1M – 1NT (12–14), responder 11–15 with exactly five in the major', () => {
    const topic = DEFAULT_TOPICS.find((t) => t.id === 'check-back-stayman')!
    const { deals } = generateDeals({ recipe: topic, count: 200, seed: 'cbs' })
    for (const deal of deals) {
      const opener = deal.hands[deal.dealer]
      const responder = deal.hands[rotateSeat(deal.dealer, 2)]
      const openerLengths = suitLengths(opener)
      expect(hcp(opener)).toBeGreaterThanOrEqual(12)
      expect(hcp(opener)).toBeLessThanOrEqual(14)
      expect(shapeClass(opener)).toBe('balanced')
      expect(openerLengths.S).toBeLessThanOrEqual(3)
      expect(openerLengths.H).toBeLessThanOrEqual(3)
      const major = openingSuit(responder)
      expect(['S', 'H']).toContain(major)
      const responderLengths = suitLengths(responder)
      expect(responderLengths[major]).toBe(5)
      expect(responderLengths[major === 'S' ? 'H' : 'S']).toBeLessThanOrEqual(3)
      expect(responderLengths.D).toBeLessThanOrEqual(4)
      expect(responderLengths.C).toBeLessThanOrEqual(4)
      expect(hcp(responder)).toBeGreaterThanOrEqual(11)
      expect(hcp(responder)).toBeLessThanOrEqual(15)
    }
  })
})

/** Konunun 200 eli; `hand(deal, n)` dealer'dan saat yönünde n. koltuğun eli. */
function sample(id: string): GeneratedDeal[] {
  const topic = DEFAULT_TOPICS.find((t) => t.id === id)!
  return generateDeals({ recipe: topic, count: 200, seed: id }).deals
}

function hand(deal: { dealer: GeneratedDeal['dealer']; hands: Deal }, offset: number): Hand {
  return deal.hands[rotateSeat(deal.dealer, offset)]
}

const MAJORS: readonly Suit[] = ['S', 'H']
const MINORS: readonly Suit[] = ['D', 'C']

describe('opening conventions', () => {
  it('Walsh: 1♣ opener; responder below game force with 4+♦ and a 4-card major', () => {
    for (const deal of sample('walsh')) {
      const opener = suitLengths(hand(deal, 0))
      const responder = hand(deal, 2)
      const lengths = suitLengths(responder)
      expect(opener.C).toBeGreaterThanOrEqual(3)
      expect(opener.D).toBeLessThanOrEqual(3)
      expect(Math.max(opener.S, opener.H)).toBeLessThanOrEqual(4)
      expect(hcp(responder)).toBeGreaterThanOrEqual(6)
      expect(hcp(responder)).toBeLessThanOrEqual(11)
      expect(lengths.D).toBeGreaterThanOrEqual(4)
      expect(Math.max(lengths.S, lengths.H)).toBe(4)
    }
  })

  it('Namyats: a strong 7–8 card major with 4 losers', () => {
    for (const deal of sample('namyats')) {
      const opener = hand(deal, 0)
      const major = openingSuit(opener)
      expect(MAJORS).toContain(major)
      expect(suitLengths(opener)[major]).toBeGreaterThanOrEqual(7)
      expect(suitLengths(opener)[major]).toBeLessThanOrEqual(8)
      expect(suitHcp(opener, major)).toBeGreaterThanOrEqual(7)
      expect(losingTrickCount(opener)).toBe(4)
    }
  })

  it('Gambling 3NT: a solid 7–8 card minor and no outside ace or king', () => {
    for (const deal of sample('gambling-3nt')) {
      const opener = hand(deal, 0)
      const minor = openingSuit(opener)
      expect(MINORS).toContain(minor)
      expect(suitLengths(opener)[minor]).toBeGreaterThanOrEqual(7)
      expect(suitHcp(opener, minor)).toBeGreaterThanOrEqual(9)
      expect(controls(opener)).toBe(3)
    }
  })
})

describe('after a notrump opening', () => {
  it('Texas transfer: 1NT opposite a 6–7 card major with game but no slam values', () => {
    for (const deal of sample('texas-transfer')) {
      const responder = hand(deal, 2)
      const lengths = suitLengths(responder)
      expect(hcp(hand(deal, 0))).toBeGreaterThanOrEqual(15)
      expect(Math.max(lengths.S, lengths.H)).toBeGreaterThanOrEqual(6)
      expect(hcp(responder)).toBeGreaterThanOrEqual(10)
      expect(hcp(responder)).toBeLessThanOrEqual(14)
    }
  })

  it('Puppet Stayman: 2NT with a 4–5 card major opposite 3–4 cards in a major', () => {
    for (const deal of sample('puppet-stayman')) {
      const opener = hand(deal, 0)
      const responder = suitLengths(hand(deal, 2))
      expect(hcp(opener)).toBeGreaterThanOrEqual(20)
      expect(shapeClass(opener)).toBe('balanced')
      const openerLengths = suitLengths(opener)
      expect(Math.max(openerLengths.S, openerLengths.H)).toBeGreaterThanOrEqual(4)
      expect(Math.max(responder.S, responder.H)).toBeGreaterThanOrEqual(3)
      expect(Math.max(responder.S, responder.H)).toBeLessThanOrEqual(4)
    }
  })
})

describe('after a suit opening', () => {
  it('Trial bid: 1M opener with 6 losers, responder a simple raise', () => {
    for (const deal of sample('trial-bid')) {
      const opener = hand(deal, 0)
      const responder = hand(deal, 2)
      const major = openingSuit(opener)
      expect(MAJORS).toContain(major)
      expect(losingTrickCount(opener)).toBe(6)
      expect(hcp(responder)).toBeGreaterThanOrEqual(6)
      expect(hcp(responder)).toBeLessThanOrEqual(9)
      expect(suitLengths(responder)[major]).toBeGreaterThanOrEqual(3)
    }
  })

  it('Wolff sign-off: 18–19 balanced minor opener, weak responder with a 5–6 card major', () => {
    for (const deal of sample('wolff-sign-off')) {
      const opener = hand(deal, 0)
      const responder = hand(deal, 2)
      const major = openingSuit(responder)
      expect(hcp(opener)).toBeGreaterThanOrEqual(18)
      expect(hcp(opener)).toBeLessThanOrEqual(19)
      expect(shapeClass(opener)).toBe('balanced')
      expect(Math.max(suitLengths(opener).S, suitLengths(opener).H)).toBeLessThanOrEqual(3)
      expect(MAJORS).toContain(major)
      expect(hcp(responder)).toBeLessThanOrEqual(7)
    }
  })
})

describe('overcalls of 1NT', () => {
  const nonBalancedWithLongSuit = (id: string) => {
    for (const deal of sample(id)) {
      const opener = hand(deal, 0)
      const overcaller = hand(deal, 1)
      expect(hcp(opener)).toBeGreaterThanOrEqual(15)
      expect(shapeClass(opener)).toBe('balanced')
      expect(shapeClass(overcaller)).not.toBe('balanced')
      expect(Math.max(...Object.values(suitLengths(overcaller)))).toBeGreaterThanOrEqual(5)
    }
  }

  it('Cappelletti: one-suiter or 5-4 two-suiter, but no 5-4 in the minors only', () => {
    nonBalancedWithLongSuit('cappelletti')
    for (const deal of sample('cappelletti')) {
      const lengths = suitLengths(hand(deal, 1))
      const minorsOnly54 =
        Math.max(lengths.S, lengths.H) <= 3 &&
        [lengths.D, lengths.C].sort().join() === [4, 5].join()
      expect(minorsOnly54).toBe(false)
    }
  })

  it('Multi-Landy: a 5+ major, not balanced', () => {
    nonBalancedWithLongSuit('multi-landy')
    for (const deal of sample('multi-landy')) {
      const lengths = suitLengths(hand(deal, 1))
      expect(Math.max(lengths.S, lengths.H)).toBeGreaterThanOrEqual(5)
    }
  })

  it('DONT: one-suiter or two-suiter, not balanced', () => {
    nonBalancedWithLongSuit('dont')
  })

  it('Landy: both majors, at least 5-4', () => {
    for (const deal of sample('landy')) {
      const lengths = suitLengths(hand(deal, 1))
      expect(Math.min(lengths.S, lengths.H)).toBeGreaterThanOrEqual(4)
      expect(Math.max(lengths.S, lengths.H)).toBeGreaterThanOrEqual(5)
    }
  })
})

describe('two-suited overcalls show the right suits for the opened suit', () => {
  const twoSuits = (id: string, expected: (opened: Suit) => readonly Suit[][]) => {
    for (const deal of sample(id)) {
      const opened = openingSuit(hand(deal, 0))
      const lengths = suitLengths(hand(deal, 1))
      const fiveCardSuits = SUITS.filter((suit) => lengths[suit] >= 5)
      // Beklenen renk çiftlerinden biri 5-5 olmalı.
      expect(expected(opened).some((pair) => pair.every((s) => fiveCardSuits.includes(s)))).toBe(
        true,
      )
    }
  }

  it('Michaels over a minor: both majors', () => {
    twoSuits('michaels-minor', (opened) => {
      expect(MINORS).toContain(opened)
      return [['S', 'H']]
    })
  })

  it('Michaels over a major: the other major and a minor', () => {
    twoSuits('michaels-major', (opened) => {
      expect(MAJORS).toContain(opened)
      const other = opened === 'S' ? 'H' : 'S'
      return [
        [other, 'D'],
        [other, 'C'],
      ]
    })
  })

  it('Unusual 2NT over a minor: hearts and the other minor', () => {
    twoSuits('unusual-nt-minor', (opened) => {
      expect(MINORS).toContain(opened)
      return [['H', opened === 'C' ? 'D' : 'C']]
    })
  })

  it('Unusual 2NT over a major: both minors', () => {
    twoSuits('unusual-nt-major', (opened) => {
      expect(MAJORS).toContain(opened)
      return [['D', 'C']]
    })
  })
})

describe('slam', () => {
  it('Gerber: 1NT opposite a balanced 16–19', () => {
    for (const deal of sample('gerber')) {
      const responder = hand(deal, 2)
      expect(hcp(hand(deal, 0))).toBeGreaterThanOrEqual(15)
      expect(hcp(responder)).toBeGreaterThanOrEqual(16)
      expect(hcp(responder)).toBeLessThanOrEqual(19)
      expect(shapeClass(responder)).toBe('balanced')
    }
  })
})

describe('groupByCategory', () => {
  it('groups topics keeping first-seen order', () => {
    const groups = groupByCategory(DEFAULT_TOPICS, (topic) => topic.category)
    expect(groups.map(([category]) => category)).toEqual([
      'Açılışlar',
      'Açılış konvansiyonları',
      'Sanzatu açılışı sonrası',
      'Açılış sonrası',
      'Rekabet',
      "1NT'ye müdahale",
      'İki renkli müdahale',
      'Şlem',
      'Oyun',
    ])
    expect(groups[0][1]).toHaveLength(5)
  })
})
