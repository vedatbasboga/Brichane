// Varsayılan konu tarifleri. Aralıklar başlangıç değerleridir; hocanın sistemine göre düzeltilecek.
// Tarifler Güney dağıtıcıymış gibi yazılır; üretimde konu eli board'un dağıtıcısına çevrilir.

import type { Recipe, SeatConstraint } from '../engine'

/** Konu seçicideki "Özel dağılım…" seçeneği. */
export const CUSTOM_TOPIC_ID = 'custom'

/** Bir sette en fazla el sayısı. */
export const MAX_DEALS = 128

const ONE_NT_OPENER: SeatConstraint = {
  hcp: [15, 17],
  shape: 'balanced',
  suits: { S: [0, 4], H: [0, 4] },
}

export const DEFAULT_TOPICS: Recipe[] = [
  {
    id: '1nt-opening',
    name: '1 Sanzatu açılışı',
    category: 'Açılışlar',
    description: "Açan: 15–17 HP, dengeli, 5'li majör yok.",
    dealer: 'S',
    seats: { S: ONE_NT_OPENER },
  },
  {
    id: '2nt-opening',
    name: '2 Sanzatu açılışı',
    category: 'Açılışlar',
    description: "Açan: 20–21 HP, dengeli, 5'li majör yok.",
    dealer: 'S',
    seats: { S: { hcp: [20, 21], shape: 'balanced', suits: { S: [0, 4], H: [0, 4] } } },
  },
  {
    id: '1-major-opening',
    name: '1 Majör açılış',
    category: 'Açılışlar',
    description: 'Açan: 12–21 HP, 5+ ♥ veya ♠.',
    dealer: 'S',
    seats: { S: { hcp: [12, 21], anySuit: { suits: ['S', 'H'], length: [5, 13] } } },
  },
  {
    id: '1-minor-opening',
    name: '1 Minör açılış',
    category: 'Açılışlar',
    description: "Açan: 12–21 HP, 5'li majör yok; 1NT (15–17) veya 2NT (20–21) dengeli eli değil.",
    dealer: 'S',
    seats: {
      S: {
        hcp: [12, 21],
        suits: { S: [0, 4], H: [0, 4] },
        exclude: [
          { hcp: [15, 17], shape: 'balanced' },
          { hcp: [20, 21], shape: 'balanced' },
        ],
      },
    },
  },
  {
    id: 'weak-two',
    name: 'Zayıf iki açılış',
    category: 'Açılışlar',
    description: "Açan: 6–10 HP, 6'lı ♦, ♥ veya ♠.",
    dealer: 'S',
    seats: { S: { hcp: [6, 10], anySuit: { suits: ['S', 'H', 'D'], length: [6, 6] } } },
  },
  {
    id: 'stayman',
    name: 'Stayman',
    category: '1NT sonrası',
    description: "Açan: 1NT eli; ortağı: 8+ HP, 4'lü majör.",
    dealer: 'S',
    seats: {
      S: ONE_NT_OPENER,
      N: {
        hcp: [8, 37],
        suits: { S: [0, 4], H: [0, 4] },
        anySuit: { suits: ['S', 'H'], length: [4, 4] },
      },
    },
  },
  {
    id: 'transfer',
    name: 'Transfer',
    category: '1NT sonrası',
    description: 'Açan: 1NT eli; ortağı: 5+ majör.',
    dealer: 'S',
    seats: { S: ONE_NT_OPENER, N: { anySuit: { suits: ['S', 'H'], length: [5, 13] } } },
  },
  {
    // 1NT – (2♦/2♥/2♠) – ?: 2NT 3♣ ister; zayıf el renginde durur, güçlü el kesere göre konuşur.
    // 2♣ müdahalesi yok sayılır (1NT – Pas gibi), bu yüzden konu rengi ♦ ♥ ♠.
    id: 'lebensohl',
    name: 'Lebensohl',
    category: '1NT sonrası',
    description:
      'Açan: 1NT eli; rakip 2♦/2♥/2♠ ile girer (8–16 HP, 5+); ortağı: 10+ HP ya da zayıf ve dağılımlı (uzun renkli), rakibin renginde en fazla 4.',
    dealer: 'S',
    topicSuit: { suits: ['S', 'H', 'D'] },
    seats: {
      S: ONE_NT_OPENER,
      W: { hcp: [8, 16], topicSuit: [5, 13], topicSuitLongest: true },
      N: {
        topicSuit: [0, 4],
        // Pas geçecek el olmasın: ya zon gücü ya da oynamak istediği uzun renk (dengeli değil).
        exclude: [{ hcp: [0, 9], shape: 'balanced' }],
      },
    },
  },
  {
    // 1♣/1♦ – 1M – 1NT – 2♣: ortağın majöründe 3'lü destek ve açanın min/max'ı sorulur.
    id: 'check-back-stayman',
    name: 'Check Back Stayman',
    category: 'Minör açılış sonrası',
    description:
      'Açan: 1♣/1♦ açıp 1NT ile tekrar eder (12–14 HP, dengeli, ♠ ve ortağın majöründe en fazla 3); ortağı: 11+ HP, 5+ majör.',
    dealer: 'S',
    topicSuit: { suits: ['S', 'H'] },
    seats: {
      // ♠ en fazla 3: 4'lü pikle 1♥ cevabına 1♠ denirdi; ♥ 4'lü olabilir (1♠ cevabından sonra 1NT).
      S: { hcp: [12, 14], shape: 'balanced', suits: { S: [0, 3], H: [0, 4] }, topicSuit: [0, 3] },
      N: { hcp: [11, 37], topicSuit: [5, 13], topicSuitLongest: true },
    },
  },
  {
    id: 'takeout-double',
    name: 'Takeout kontr',
    category: 'Rekabet',
    description: 'Rakip bir renk açar (5+); kontr eden: 12+ HP, açılan renkte kısa (0–1).',
    dealer: 'E',
    topicSuit: { suits: ['S', 'H', 'D', 'C'] },
    seats: {
      E: { hcp: [12, 21], topicSuit: [5, 13], topicSuitLongest: true },
      S: { hcp: [12, 21], topicSuit: [0, 1] },
    },
  },
  {
    id: 'overcall',
    name: 'Renk müdahalesi',
    category: 'Rekabet',
    description: 'Rakip bir renk açar (5+); müdahale eden: 8–16 HP, başka bir renkte 5+.',
    dealer: 'E',
    topicSuit: { suits: ['S', 'H', 'D', 'C'] },
    seats: {
      E: { hcp: [12, 21], topicSuit: [5, 13], topicSuitLongest: true },
      S: {
        hcp: [8, 16],
        topicSuit: [0, 3],
        anySuit: { suits: ['S', 'H', 'D', 'C'], length: [5, 13] },
      },
    },
  },
  {
    id: 'slam',
    name: 'Blackwood / şlem',
    category: 'Şlem',
    description: 'Ortaklık toplam 33+ HP, 8+ fit.',
    dealer: 'S',
    seats: {},
    pair: { NS: { hcp: [33, 40], fit: { length: [8, 13] } } },
  },
  {
    id: 'nt-play',
    name: 'Sanzatu oyun planı',
    category: 'Oyun',
    description: 'Ortaklık 25–27 HP, iki el dengeli.',
    dealer: 'S',
    seats: { N: { shape: 'balanced' }, S: { shape: 'balanced' } },
    pair: { NS: { hcp: [25, 27] } },
  },
]

/** Kategoriye göre gruplar, ilk görülme sırasını korur. */
export function groupByCategory<T>(
  items: readonly T[],
  categoryOf: (item: T) => string,
): [string, T[]][] {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const category = categoryOf(item)
    const group = groups.get(category)
    if (group) group.push(item)
    else groups.set(category, [item])
  }
  return [...groups]
}
