import { describe, expect, it } from 'vitest'
import { RANK_ACE, RANK_JACK, RANK_KING, RANK_QUEEN, RANK_TEN, makeCard, type Deal } from './cards'
import { tricksFromDds, type DdResult } from './dd'
import { parsePbnDeal } from './pbn'
import {
  cellContract,
  choosePlay,
  contractResult,
  defaultContract,
  openingLeader,
  playStateAt,
  trickWinner,
  type PlayLine,
  type PlayStep,
} from './play'

const c = makeCard

describe('trickWinner', () => {
  it('takes the highest card of the led suit in NT', () => {
    const trick = [
      { seat: 'N' as const, card: c('S', 3) },
      { seat: 'E' as const, card: c('S', RANK_KING) },
      { seat: 'S' as const, card: c('S', RANK_ACE) },
      { seat: 'W' as const, card: c('H', RANK_ACE) },
    ]
    expect(trickWinner(trick, 'N')).toBe('S')
  })

  it('lets the highest trump win', () => {
    const trick = [
      { seat: 'N' as const, card: c('S', RANK_ACE) },
      { seat: 'E' as const, card: c('H', 0) },
      { seat: 'S' as const, card: c('S', RANK_KING) },
      { seat: 'W' as const, card: c('H', 1) },
    ]
    expect(trickWinner(trick, 'H')).toBe('W')
  })

  it('ignores discards of other suits', () => {
    const trick = [
      { seat: 'N' as const, card: c('C', 0) },
      { seat: 'E' as const, card: c('S', RANK_ACE) },
      { seat: 'S' as const, card: c('C', 1) },
      { seat: 'W' as const, card: c('D', RANK_ACE) },
    ]
    expect(trickWinner(trick, 'N')).toBe('S')
  })
})

describe('choosePlay', () => {
  const sequence = [c('S', RANK_QUEEN), c('S', RANK_JACK), c('S', RANK_TEN)]

  it('leads the top of equivalent cards and follows with the lowest', () => {
    const options = [
      { cards: sequence, score: 5 },
      { cards: [c('S', 0)], score: 4 },
    ]
    expect(choosePlay(options, true).card).toBe(c('S', RANK_QUEEN))
    expect(choosePlay(options, false).card).toBe(c('S', RANK_TEN))
    const lead = choosePlay(options, true)
    expect(lead.alternatives).toEqual([c('S', RANK_JACK), c('S', RANK_TEN)])
    expect(lead.critical).toBe(false)
    expect(lead.forced).toBe(false)
  })

  it('marks a play as critical when only one card keeps the best result', () => {
    const result = choosePlay(
      [
        { cards: [c('H', RANK_ACE)], score: 7 },
        { cards: [c('C', 0)], score: 6 },
      ],
      false,
    )
    expect(result).toEqual({
      card: c('H', RANK_ACE),
      alternatives: [],
      critical: true,
      forced: false,
    })
  })

  it('marks a single legal card as forced, not critical', () => {
    expect(choosePlay([{ cards: [c('D', 3)], score: 2 }], false)).toEqual({
      card: c('D', 3),
      alternatives: [],
      critical: false,
      forced: true,
    })
  })

  it('lists alternatives from other optimal groups in display order', () => {
    const result = choosePlay(
      [
        { cards: [c('C', 4)], score: 3 },
        { cards: [c('S', 2)], score: 3 },
        { cards: [c('H', RANK_KING)], score: 1 },
      ],
      true,
    )
    expect(result.card).toBe(c('C', 4))
    expect(result.alternatives).toEqual([c('S', 2)])
  })
})

describe('playStateAt', () => {
  // Her oyuncuda tek renk: K ♠, D ♥, G ♦, B ♣. K NT deklare, çıkış D; her lövesini D alır.
  const deal: Deal = parsePbnDeal(
    'N:AKQJT98765432... .AKQJT98765432.. ..AKQJT98765432. ...AKQJT98765432',
  )
  const steps: PlayStep[] = []
  for (let t = 0; t < 13; t++) {
    const extra = { alternatives: [], critical: false, forced: false }
    steps.push(
      { seat: 'E', card: c('H', 12 - t), ...extra },
      { seat: 'S', card: c('D', t), ...extra },
      { seat: 'W', card: c('C', t), ...extra },
      { seat: 'N', card: c('S', t), ...extra },
    )
  }
  const line: PlayLine = { declarer: 'N', strain: 'N', steps, declarerTricks: 0 }

  it('starts with full hands and the opening leader to play', () => {
    const state = playStateAt(deal, line, 0)
    expect(openingLeader('N')).toBe('E')
    expect(state.toPlay).toBe('E')
    expect(state.trick).toEqual([])
    expect(state.hands.E).toHaveLength(13)
  })

  it('shows the trick in progress', () => {
    const state = playStateAt(deal, line, 2)
    expect(state.trick.map((t) => t.seat)).toEqual(['E', 'S'])
    expect(state.winner).toBeNull()
    expect(state.toPlay).toBe('W')
    expect(state.hands.E).toHaveLength(12)
  })

  it('keeps a completed trick on the table with its winner until the next card', () => {
    const done = playStateAt(deal, line, 4)
    expect(done.trick).toHaveLength(4)
    expect(done.winner).toBe('E')
    expect(done.tricks).toEqual({ NS: 0, EW: 1 })
    expect(done.toPlay).toBe('E')
    const next = playStateAt(deal, line, 5)
    expect(next.trick).toHaveLength(1)
    expect(next.winner).toBeNull()
  })

  it('ends with all tricks counted and nobody to play', () => {
    const end = playStateAt(deal, line, 52)
    expect(end.completed).toBe(13)
    expect(end.tricks).toEqual({ NS: 0, EW: 13 })
    expect(end.toPlay).toBeNull()
  })
})

describe('contracts', () => {
  const tricks = tricksFromDds([
    [10, 3, 9, 3],
    [8, 3, 8, 3],
    [7, 4, 7, 4],
    [6, 5, 6, 5],
    [9, 3, 9, 3],
  ])
  const dd = (contracts: string[]): DdResult => ({ tricks, par: { score: 420, contracts } })

  it('plays the par contract by the declarer who takes more tricks', () => {
    expect(defaultContract(dd(['4S-NS']))).toEqual({ declarer: 'N', strain: 'S', level: 4 })
  })

  it('turns overtricks into the equivalent level', () => {
    expect(defaultContract(dd(['1S-NS+2']))).toEqual({ declarer: 'N', strain: 'S', level: 3 })
  })

  it('falls back to the best cell without a par contract', () => {
    expect(defaultContract(dd([]))).toEqual({ declarer: 'N', strain: 'S', level: 4 })
  })

  it('builds a contract from a table cell', () => {
    expect(cellContract('E', 'C', 5)).toEqual({ declarer: 'E', strain: 'C', level: 1 })
    expect(cellContract('S', 'N', 9)).toEqual({ declarer: 'S', strain: 'N', level: 3 })
  })

  it('scores the result against the contract', () => {
    expect(contractResult({ declarer: 'N', strain: 'N', level: 2 }, 9)).toBe(1)
    expect(contractResult({ declarer: 'N', strain: 'N', level: 2 }, 8)).toBe(0)
    expect(contractResult({ declarer: 'N', strain: 'N', level: 2 }, 6)).toBe(-2)
  })
})
