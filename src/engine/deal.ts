import { SEATS, rotateSeat, sortDeal, type Deal } from './cards'
import { randomInt, type Rng } from './random'

/** Fisher–Yates karıştırma, diziyi yerinde değiştirir. */
export function shuffle<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(rng, i + 1)
    const tmp = items[i]
    items[i] = items[j]
    items[j] = tmp
  }
  return items
}

/** Eller sıralanmadan dağıtır (üretici için hızlı yol). */
export function dealUnsorted(rng: Rng): Deal {
  const deck = shuffle(
    Array.from({ length: 52 }, (_, i) => i),
    rng,
  )
  return {
    N: deck.slice(0, 13),
    E: deck.slice(13, 26),
    S: deck.slice(26, 39),
    W: deck.slice(39, 52),
  }
}

/** Rastgele dağıtım, eller sıralı. */
export function dealRandom(rng: Rng): Deal {
  return sortDeal(dealUnsorted(rng))
}

/** Elleri saat yönünde `steps` koltuk çevirir; 2 = 180° (N↔S, E↔W). */
export function rotateDeal(deal: Deal, steps: number): Deal {
  const result = {} as Deal
  for (const seat of SEATS) result[rotateSeat(seat, steps)] = deal[seat]
  return result
}
