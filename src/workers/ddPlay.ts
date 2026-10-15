// Bir kontratı DDS ile ilk çıkıştan son löveye kadar kusursuz oynatır. Her kartta DDS'e
// "sırası gelen oyuncu hangi kartla kaç löve alır" diye sorulur (SolveBoardPBN, bütün kartlar),
// en iyi kartlardan biri oynanır. Sonuç, tablodaki löve sayısıyla aynıdır.

import type { Dds } from 'bridge-dds'
import {
  byDisplayOrder,
  cardRank,
  cardSuitIndex,
  choosePlay,
  dealToPbn,
  defenderSignal,
  openingLeader,
  optimalCards,
  rotateSeat,
  trickWinner,
  type Card,
  type Carding,
  type Deal,
  type PlayLine,
  type PlayOption,
  type PlayStep,
  type PlayedCard,
  type Seat,
  type Strain,
} from '../engine'

const DDS_TRUMP: Record<Strain, number> = { S: 0, H: 1, D: 2, C: 3, N: 4 }
const DDS_SEAT: Record<Seat, number> = { N: 0, E: 1, S: 2, W: 3 }
/** SolveBoard: bütün oynanabilir kartları skorlarıyla döndür. */
const ALL_CARDS = 3

// DDS renk sırası bizimkiyle aynı (♠0 ♥1 ♦2 ♣3); DDS değeri 2..14, bizde 0..12.
const ddsSuit = (card: Card) => cardSuitIndex(card)
const ddsRank = (card: Card) => cardRank(card) + 2
const fromDds = (suit: number, rank: number): Card => suit * 13 + (rank - 2)

export interface PlayLineOptions {
  /** Savunmacılar en iyi kartlar arasından bu anlaşmaya göre apel verir. */
  carding?: Carding
  /** Zorunlu ilk çıkış (konu gereği); çift kukla en iyisi olmasa da oynanır. */
  openingLead?: Card
}

export function computePlayLine(
  dds: Dds,
  deal: Deal,
  declarer: Seat,
  strain: Strain,
  { carding, openingLead }: PlayLineOptions = {},
): PlayLine {
  const hands: Deal = { N: [...deal.N], E: [...deal.E], S: [...deal.S], W: [...deal.W] }
  let leader = openingLeader(declarer)
  let trick: PlayedCard[] = []
  const history: PlayedCard[] = []
  const steps: PlayStep[] = []
  let declarerTricks = 0

  for (let n = 0; n < 52; n++) {
    const toPlay = rotateSeat(leader, trick.length)
    const result = dds.SolveBoardPBN(
      {
        trump: DDS_TRUMP[strain],
        first: DDS_SEAT[leader],
        currentTrickSuit: trick.map((t) => ddsSuit(t.card)),
        currentTrickRank: trick.map((t) => ddsRank(t.card)),
        remainCards: dealToPbn(hands, 'N'),
      },
      -1,
      ALL_CARDS,
      // İlk çağrıdan sonra aynı dağıtımın arama tablosu yeniden kullanılır (çok daha hızlı).
      n === 0 ? 1 : 2,
    )

    const options: PlayOption[] = []
    for (let i = 0; i < result.cards; i++) {
      const top = result.rank[i]
      const ranks = [top]
      // `equals`: bu kartla eşdeğer daha küçük değerler (bit = değer).
      for (let r = top - 1; r >= 2; r--) if (result.equals[i] & (1 << r)) ranks.push(r)
      options.push({
        cards: ranks.map((rank) => fromDds(result.suit[i], rank)),
        score: result.score[i],
      })
    }

    const optimal = optimalCards(options)
    const legal = options.flatMap((o) => o.cards)
    let step: PlayStep
    if (n === 0 && openingLead !== undefined && legal.includes(openingLead)) {
      const best = Math.max(...options.map((o) => o.score))
      const score = options.find((o) => o.cards.includes(openingLead))!.score
      step = {
        seat: toPlay,
        card: openingLead,
        alternatives: optimal.filter((c) => c !== openingLead).sort(byDisplayOrder),
        critical: false,
        forced: legal.length === 1,
        topicLead: { loss: best - score },
      }
    } else {
      const signal = carding
        ? defenderSignal(
            { deal, hands, declarer, strain, history, seat: toPlay },
            optimal,
            legal,
            carding,
          )
        : null
      step = { seat: toPlay, ...choosePlay(options, trick.length === 0, signal?.card) }
      if (signal) step.signal = signal.note
    }
    steps.push(step)
    hands[toPlay] = hands[toPlay].filter((c) => c !== step.card)
    trick.push({ seat: toPlay, card: step.card })
    history.push({ seat: toPlay, card: step.card })

    if (trick.length === 4) {
      const winner = trickWinner(trick, strain)
      if (winner === declarer || winner === rotateSeat(declarer, 2)) declarerTricks++
      leader = winner
      trick = []
    }
  }

  return { declarer, strain, steps, declarerTricks }
}
