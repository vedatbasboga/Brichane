import { describe, expect, it } from 'vitest'
import {
  RANK_ACE,
  RANK_TEN,
  cardRank,
  cardSuit,
  cardToString,
  formatHand,
  handBySuit,
  makeCard,
  pairOf,
  partnerOf,
  rotateSeat,
  sortHand,
} from './cards'

describe('card encoding', () => {
  it('maps suit × 13 + rank with ♠ ♥ ♦ ♣ order', () => {
    expect(makeCard('S', 0)).toBe(0)
    expect(makeCard('S', RANK_ACE)).toBe(12)
    expect(makeCard('H', 0)).toBe(13)
    expect(makeCard('C', RANK_ACE)).toBe(51)
  })

  it('decodes suit and rank', () => {
    const card = makeCard('D', RANK_TEN)
    expect(cardSuit(card)).toBe('D')
    expect(cardRank(card)).toBe(RANK_TEN)
  })

  it('formats cards as text', () => {
    expect(cardToString(makeCard('S', RANK_ACE))).toBe('♠A')
    expect(cardToString(makeCard('H', RANK_TEN))).toBe('♥10')
    expect(cardToString(makeCard('C', 0))).toBe('♣2')
  })
})

describe('hand helpers', () => {
  const hand = [
    makeCard('C', 3),
    makeCard('S', 0),
    makeCard('H', RANK_ACE),
    makeCard('S', RANK_ACE),
    makeCard('H', RANK_TEN),
  ]

  it('sorts by suit then rank descending', () => {
    expect(sortHand(hand).map(cardToString)).toEqual(['♠A', '♠2', '♥A', '♥10', '♣5'])
  })

  it('does not mutate the input', () => {
    const copy = [...hand]
    sortHand(hand)
    expect(hand).toEqual(copy)
  })

  it('groups by suit', () => {
    expect(handBySuit(hand)).toEqual({ S: [RANK_ACE, 0], H: [RANK_ACE, RANK_TEN], D: [], C: [3] })
  })

  it('formats a hand with void marker', () => {
    expect(formatHand(hand)).toBe('♠A2 ♥A10 ♦— ♣5')
  })
})

describe('seats', () => {
  it('finds partners and pairs', () => {
    expect(partnerOf('N')).toBe('S')
    expect(partnerOf('E')).toBe('W')
    expect(pairOf('S')).toBe('NS')
    expect(pairOf('W')).toBe('EW')
  })

  it('rotates clockwise, including negative steps', () => {
    expect(rotateSeat('N', 1)).toBe('E')
    expect(rotateSeat('W', 1)).toBe('N')
    expect(rotateSeat('N', -1)).toBe('W')
    expect(rotateSeat('E', 6)).toBe('W')
  })
})
