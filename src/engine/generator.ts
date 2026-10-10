import { boardDealer, boardVulnerability, type Vulnerability } from './board'
import { SEATS, rotateSeat, seatDistance, sortDeal, type Deal, type Seat } from './cards'
import { dealUnsorted, rotateDeal } from './deal'
import { randomSeed, seededRng } from './random'
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
  /** Tariften saat yönünde kaç koltuk çevrildi (0–3); geri almak için `rotateDeal(hands, -rotation)`. */
  rotation: number
  /** Konu elleri (çevirme sonrası koltuklar), N E S W sırasıyla. */
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

/** Board'un dağıtıcısı ve dağıtımın tariften kaç koltuk çevrileceği. */
export function placeDeal(recipe: Recipe, board: number): { dealer: Seat; rotation: number } {
  if (recipe.placement === 'fixed') {
    return { dealer: recipe.dealer ?? boardDealer(board), rotation: 0 }
  }
  const dealer = boardDealer(board)
  return { dealer, rotation: seatDistance(recipe.dealer ?? 'N', dealer) }
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
      const { dealer, rotation } = placeDeal(recipe, board)
      const rotatedFocus = new Set(baseFocus.map((seat) => rotateSeat(seat, rotation)))
      deals.push({
        board,
        dealer,
        vul: boardVulnerability(board),
        hands: sortDeal(rotation ? rotateDeal(hands, rotation) : hands),
        rotation,
        focusSeats: SEATS.filter((seat) => rotatedFocus.has(seat)),
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
