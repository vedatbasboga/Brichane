import { describe, expect, it } from 'vitest'
import { DEFAULT_TOPICS } from '../data/topics'
import { generateDeals, parsePbnDeal, tricksFromDds, type DdResult } from '../engine'
import { buildPbnFile, optimumScore, parContract } from './pbnFile'

const { deals } = generateDeals({ recipe: DEFAULT_TOPICS[0], count: 4, seed: 'pbn-export' })
const dd: DdResult = {
  tricks: tricksFromDds([
    [10, 3, 10, 3],
    [10, 3, 10, 3],
    [8, 4, 8, 4],
    [8, 5, 8, 5],
    [8, 3, 8, 3],
  ]),
  par: { score: 420, contracts: ['4S-NS', '4H-NS'] },
}

/** Basit PBN okuyucu: boş satırla ayrılmış oyunlar, etiketler ve yorumlar. */
function readPbn(text: string) {
  const blocks = text.split('\r\n\r\n').filter((b) => b.includes('[Board'))
  return blocks.map((block) => {
    const tags: Record<string, string> = {}
    for (const line of block.split('\r\n')) {
      const m = /^\[(\w+) "(.*)"\]$/.exec(line)
      if (m) tags[m[1]] = m[2].replace(/\\(["\\])/g, '$1')
    }
    const comment = /\{([\s\S]*?)\}/.exec(block)?.[1]
    const table = block.split('\r\n').filter((l) => /^[NESW] (NT|[SHDC]) \d+$/.test(l))
    return { tags, comment, table }
  })
}

describe('buildPbnFile', () => {
  const file = buildPbnFile({
    event: 'Ders "1" · 1NT',
    date: new Date(2026, 9, 10),
    deals,
    dd: [dd, undefined, dd, dd],
    notes: 'Genel not',
    boardNotes: { 1: 'Oyun planı: {♠} emniyet\nİkinci satır', 3: '' },
    sourceUrl: 'https://brichane-0.web.app/sets/x',
  })
  const games = readPbn(file)

  it('starts with the PBN header and uses CRLF line endings', () => {
    expect(file.startsWith('% PBN 2.1\r\n% EXPORT\r\n')).toBe(true)
    expect(file.replace(/\r\n/g, '')).not.toMatch(/\n/)
    expect(file).toContain('{Genel not}')
  })

  it('writes one game per board with standard tags', () => {
    expect(games).toHaveLength(4)
    games.forEach((game, i) => {
      expect(game.tags.Board).toBe(String(deals[i].board))
      expect(game.tags.Dealer).toBe(deals[i].dealer)
      expect(game.tags.Vulnerable).toBe(deals[i].vul)
      expect(game.tags.Date).toBe('2026.10.10')
      expect(game.tags.Event).toBe('Ders "1" · 1NT')
    })
  })

  it('writes deals starting with the dealer that parse back to the same hands', () => {
    games.forEach((game, i) => {
      expect(game.tags.Deal.startsWith(`${deals[i].dealer}:`)).toBe(true)
      expect(parsePbnDeal(game.tags.Deal)).toEqual(deals[i].hands)
    })
  })

  it('writes double dummy tags only for boards that have results', () => {
    expect(games[0].tags.DoubleDummyTricks).toBe('8aa8833345' + '8aa8833345')
    expect(games[0].tags.OptimumScore).toBe('NS 420')
    expect(games[0].tags.ParContract).toBe('NS 4S')
    expect(file).toContain('[OptimumResultTable "Declarer;Denomination\\2R;Result\\2R"]')
    expect(games[0].table).toHaveLength(20)
    expect(games[0].table[0]).toBe('N NT 8')
    expect(games[0].table).toContain('E C 5')
    expect(games[1].tags.DoubleDummyTricks).toBeUndefined()
    expect(games[1].table).toHaveLength(0)
  })

  it('writes board notes as comments, replacing braces and keeping lines', () => {
    expect(games[0].comment).toBe('Oyun planı: (♠) emniyet\r\nİkinci satır')
    expect(games[2].comment).toBeUndefined()
  })
})

describe('par tags', () => {
  it('formats optimum score for the side that gains', () => {
    expect(optimumScore(420)).toBe('NS 420')
    expect(optimumScore(-620)).toBe('EW 620')
    expect(optimumScore(0)).toBe('NS 0')
  })

  it('formats the first par contract', () => {
    expect(parContract({ score: 140, contracts: ['1S-NS+2'] })).toBe('NS 3S')
    expect(parContract({ score: -500, contracts: ['5D*-EW-3'] })).toBe('EW 5DX')
    expect(parContract({ score: 430, contracts: ['3N-N+1'] })).toBe('N 4NT')
    expect(parContract({ score: 0, contracts: [] })).toBeNull()
  })
})
