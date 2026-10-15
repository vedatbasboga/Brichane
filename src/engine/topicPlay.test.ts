import { describe, expect, it } from 'vitest'
import { RANK_ACE, RANK_KING, cardRank, cardSuit, makeCard, rotateSeat } from './cards'
import { suitLengths } from './evaluate'
import { generateDeals } from './generator'
import { openingLeader } from './play'
import type { Recipe } from './recipe'
import { ONE_NT_RECIPE } from './testFixtures'
import { topicPlay } from './topicPlay'

// Batı AK'lı 5+ renkle çıkar, Güney 3NT oynar.
const ACE_LEAD: Recipe = {
  id: 'ace-lead',
  name: 'As çıkışı',
  category: 'Test',
  dealer: 'S',
  topicSuit: { suits: ['S', 'H', 'D', 'C'] },
  contract: { declarer: 'S', strain: 'N', level: 3, lead: 'top' },
  seats: { W: { topicSuit: [5, 6], topicSuitCards: [RANK_ACE, RANK_KING] } },
}

describe('topicPlay', () => {
  it('returns null for recipes without a contract', () => {
    const { deals } = generateDeals({ recipe: ONE_NT_RECIPE, count: 1, seed: 'x' })
    expect(topicPlay(ONE_NT_RECIPE, deals[0])).toBeNull()
  })

  it('rotates the declarer with the deal and leads the top card of the topic suit', () => {
    const { deals } = generateDeals({ recipe: ACE_LEAD, count: 8, seed: 'ace-lead' })
    expect(new Set(deals.map((d) => d.rotation)).size).toBe(4)
    for (const deal of deals) {
      const play = topicPlay(ACE_LEAD, deal)!
      expect(play.contract).toEqual({
        declarer: rotateSeat('S', deal.rotation),
        strain: 'N',
        level: 3,
      })
      const leader = openingLeader(play.contract.declarer)
      expect(cardRank(play.lead!)).toBe(RANK_ACE)
      expect(deal.hands[leader]).toContain(makeCard(cardSuit(play.lead!), RANK_KING))
    }
  })

  it('leads the fourth best card on request', () => {
    const recipe: Recipe = { ...ACE_LEAD, contract: { ...ACE_LEAD.contract!, lead: 'fourth' } }
    const { deals } = generateDeals({ recipe, count: 4, seed: 'fourth' })
    for (const deal of deals) {
      const play = topicPlay(recipe, deal)!
      const leader = openingLeader(play.contract.declarer)
      const suit = cardSuit(play.lead!)
      const holding = deal.hands[leader]
        .filter((c) => cardSuit(c) === suit)
        .sort((a, b) => cardRank(b) - cardRank(a))
      expect(suitLengths(deal.hands[leader])[suit]).toBeGreaterThanOrEqual(5)
      expect(play.lead).toBe(holding[3])
    }
  })

  it('keeps fixed placements in the written seats', () => {
    const recipe: Recipe = { ...ACE_LEAD, placement: 'fixed' }
    const { deals } = generateDeals({ recipe, count: 4, seed: 'fixed' })
    for (const deal of deals) expect(topicPlay(recipe, deal)!.contract.declarer).toBe('S')
  })
})
