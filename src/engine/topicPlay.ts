// Konunun kendi kontratı (tarifteki `contract`): dağıtım koltuk çevrildiyse kontrat da çevrilir;
// çıkış konu renginden isteniyorsa çıkan elin o renkteki kartı bulunur.

import { cardRank, cardSuit, rotateSeat, type Card, type Deal } from './cards'
import { rotateDeal } from './deal'
import { placeDeal } from './generator'
import { openingLeader, type PlayContract } from './play'
import { matchedTopicSuit, type Recipe } from './recipe'

export interface TopicPlay {
  contract: PlayContract
  /** Zorunlu ilk çıkış (konu renginden). */
  lead?: Card
}

export function topicPlay(recipe: Recipe, deal: { board: number; hands: Deal }): TopicPlay | null {
  const spec = recipe.contract
  if (!spec) return null
  const { rotation } = placeDeal(recipe, deal.board)
  const contract: PlayContract = {
    declarer: rotateSeat(spec.declarer, rotation),
    strain: spec.strain,
    level: spec.level,
  }
  if (!spec.lead) return { contract }
  const suit = matchedTopicSuit(rotateDeal(deal.hands, -rotation), recipe)
  if (!suit) return { contract }
  const holding = deal.hands[openingLeader(contract.declarer)]
    .filter((c) => cardSuit(c) === suit)
    .sort((a, b) => cardRank(b) - cardRank(a))
  if (!holding.length) return { contract }
  const lead = spec.lead === 'top' ? holding[0] : (holding[3] ?? holding[holding.length - 1])
  return { contract, lead }
}
