import { boardDealer, boardVulnerability, type Vulnerability } from './board'
import { partnerOf, rotateSeat, sortDeal, type Deal, type Seat } from './cards'
import { dealUnsorted, rotateDeal } from './deal'
import { randomInt, randomSeed, seededRng } from './random'
import { focusSeats, matchesRecipe, type Recipe } from './recipe'

export const DEFAULT_MAX_ATTEMPTS = 1_000_000

/** Bu kadar denemede bir ilerleme bildirilir (el bulununca da bildirilir). */
const PROGRESS_INTERVAL = 20_000

export interface GenerateOptions {
  recipe: Recipe
  count: number
  /** Boş bırakılırsa rastgele tohum üretilir ve sonuçta döner. */
  seed?: string
  maxAttempts?: number
  firstBoard?: number
}

export interface GeneratedDeal {
  board: number
  dealer: Seat
  vul: Vulnerability
  hands: Deal
  /** El 180° çevrildi mi (tarifte `rotate` açıksa). */
  rotated: boolean
  /** Konu elleri (çevirme sonrası koltuklar). */
  focusSeats: Seat[]
}

export interface GenerateProgress {
  found: number
  count: number
  attempts: number
}

export interface GenerateResult {
  /** `exhausted`: deneme sınırına ulaşıldı, istenen sayıda el bulunamadı. */
  status: 'ok' | 'exhausted'
  seed: string
  deals: GeneratedDeal[]
  attempts: number
  /** Bulunan / deneme — tarifin gözlenen olasılığı. */
  observedProbability: number
}

/** Reddetme örneklemesi: dağıt → kontrol et → uymazsa at. */
export function generateDeals(
  options: GenerateOptions,
  onProgress?: (progress: GenerateProgress) => void,
): GenerateResult {
  const { recipe, count, maxAttempts = DEFAULT_MAX_ATTEMPTS, firstBoard = 1 } = options
  if (!Number.isInteger(count) || count < 1) throw new RangeError(`Invalid count ${count}`)

  const seed = options.seed?.trim() || randomSeed()
  const rng = seededRng(seed)
  const baseFocus = focusSeats(recipe)
  const deals: GeneratedDeal[] = []
  let attempts = 0

  while (deals.length < count && attempts < maxAttempts) {
    attempts++
    const hands = dealUnsorted(rng)
    if (matchesRecipe(hands, recipe)) {
      const board = firstBoard + deals.length
      const rotated = recipe.rotate === true && randomInt(rng, 2) === 1
      const dealer = recipe.dealer ?? boardDealer(board)
      deals.push({
        board,
        dealer: rotated && recipe.dealer ? partnerOf(dealer) : dealer,
        vul: boardVulnerability(board),
        hands: sortDeal(rotated ? rotateDeal(hands, 2) : hands),
        rotated,
        focusSeats: rotated ? baseFocus.map((seat) => rotateSeat(seat, 2)) : baseFocus,
      })
      onProgress?.({ found: deals.length, count, attempts })
    } else if (attempts % PROGRESS_INTERVAL === 0) {
      onProgress?.({ found: deals.length, count, attempts })
    }
  }

  return {
    status: deals.length === count ? 'ok' : 'exhausted',
    seed,
    deals,
    attempts,
    observedProbability: attempts === 0 ? 0 : deals.length / attempts,
  }
}
