import { Dds, loadDds } from 'bridge-dds'
import { beforeAll, describe, expect, it } from 'vitest'
import { DEFAULT_TOPICS } from '../data/topics'
import {
  DEFAULT_CARDING,
  SEATS,
  dealRandom,
  generateDeals,
  pairOf,
  topicPlay,
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

  it('signals only among the double dummy best cards, so the result stays the same', () => {
    const rng = seededRng('signals')
    const contracts: [Seat, Strain][] = [
      ['S', 'N'],
      ['N', 'H'],
      ['E', 'N'],
      ['W', 'S'],
    ]
    for (const [declarer, strain] of contracts) {
      const deal = dealRandom(rng)
      const table = tricksFromDds(dds.CalcDDTablePBN({ cards: dealToPbn(deal) }).resTable)
      for (const carding of [
        DEFAULT_CARDING,
        { signals: 'udca', discards: 'lavinthal' } as const,
      ]) {
        const line = computePlayLine(dds, deal, declarer, strain, { carding })
        expect(line.declarerTricks).toBe(table[declarer][strain])
        for (const step of line.steps) {
          expect(step.alternatives).not.toContain(step.card)
          // Apeli yalnızca savunma verir.
          if (step.signal) expect(pairOf(step.seat)).not.toBe(pairOf(declarer))
        }
      }
    }
  }, 60000)

  it('plays the topic lead first and lets the defence signal', () => {
    const recipe = DEFAULT_TOPICS.find((t) => t.id === 'signal-attitude-nt')!
    const { deals } = generateDeals({ recipe, count: 4, seed: 'dds-attitude' })
    let attitudes = 0
    for (const deal of deals) {
      const play = topicPlay(recipe, deal)!
      const { declarer, strain } = play.contract
      const line = computePlayLine(dds, deal.hands, declarer, strain, {
        carding: DEFAULT_CARDING,
        openingLead: play.lead,
      })
      expect(line.steps[0].card).toBe(play.lead)
      expect(line.steps[0].topicLead?.loss).toBeGreaterThanOrEqual(0)
      // Üçüncü el As çıkışına tutum verir (seçeneği varsa).
      const third = line.steps[2].signal
      if (third) {
        expect(third.signal.kind).toBe('attitude')
        attitudes++
      }
    }
    expect(attitudes).toBeGreaterThan(0)
  }, 60000)
})
