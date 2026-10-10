// Testlerde ortak kullanılan örnek dağıtım ve tarifler.

import type { Recipe } from './recipe'

/**
 * N: ♠AKQ2 ♥KJ3 ♦T98 ♣765     — 13 HP, 4-3-3-3
 * E: ♠JT98 ♥AQ2 ♦765 ♣432     —  7 HP
 * S: ♠7654 ♥T987 ♦AKQ ♣AK     — 16 HP, 4-4-3-2
 * W: ♠3 ♥654 ♦J432 ♣QJT98     —  4 HP
 */
export const SAMPLE_DEAL_PBN =
  'N:AKQ2.KJ3.T98.765 JT98.AQ2.765.432 7654.T987.AKQ.AK 3.654.J432.QJT98'

export const ONE_NT_RECIPE: Recipe = {
  id: '1nt-opening',
  name: '1 Sanzatu Açılışı',
  category: 'Açılışlar',
  dealer: 'S',
  seats: {
    S: { hcp: [15, 17], shape: 'balanced', suits: { S: [0, 4], H: [0, 4] } },
  },
  pair: {},
  placement: 'fixed',
}
