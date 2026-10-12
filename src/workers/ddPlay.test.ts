import { Dds, loadDds } from 'bridge-dds'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  SEATS,
  dealRandom,
  dealToPbn,
  playStateAt,
  seededRng,
  tricksFromDds,
  type Seat,
  type Strain,
} from '../engine'
import { computePlayLine } from './ddPlay'

let dds: Dds

beforeAll(async () => {
  dds = new Dds(await loadDds())
})

describe('computePlayLine (gerçek DDS)', () => {
  it('plays every card once and reaches the double dummy result', () => {
    const rng = seededRng('play-line')
    const contracts: [Seat, Strain][] = [
      ['N', 'N'],
      ['S', 'S'],
      ['E', 'H'],
      ['W', 'C'],
    ]
    for (let i = 0; i < 4; i++) {
      const deal = dealRandom(rng)
      const table = tricksFromDds(dds.CalcDDTablePBN({ cards: dealToPbn(deal) }).resTable)
      const [declarer, strain] = contracts[i]
      const line = computePlayLine(dds, deal, declarer, strain)

      expect(line.steps).toHaveLength(52)
      expect(new Set(line.steps.map((s) => s.card)).size).toBe(52)
      expect(line.declarerTricks).toBe(table[declarer][strain])

      // Kart sahibi doğru ve oyunun sonu tutarlı.
      for (const step of line.steps) expect(deal[step.seat]).toContain(step.card)
      const end = playStateAt(deal, line, 52)
      expect(end.completed).toBe(13)
      for (const seat of SEATS) expect(end.hands[seat]).toHaveLength(0)
      const declarerSide = declarer === 'N' || declarer === 'S' ? 'NS' : 'EW'
      expect(end.tricks[declarerSide]).toBe(line.declarerTricks)
    }
  }, 60000)

  it('flags critical and forced plays consistently', () => {
    const deal = dealRandom(seededRng('critical'))
    const line = computePlayLine(dds, deal, 'S', 'N')
    for (const step of line.steps) {
      if (step.forced) expect(step.critical).toBe(false)
      if (step.critical) expect(step.alternatives).toHaveLength(0)
      expect(step.alternatives).not.toContain(step.card)
    }
    // Son lövede herkesin tek kartı vardır.
    expect(line.steps.slice(-4).every((s) => s.forced)).toBe(true)
  }, 60000)
})
