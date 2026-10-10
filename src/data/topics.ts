// Varsayılan konu tarifleri. Aralıklar başlangıç değerleridir; hocanın sistemine göre düzeltilecek.

import type { Range, Recipe } from '../engine'

const ONE_NT_OPENER = {
  hcp: [15, 17] as Range,
  shape: 'balanced' as const,
  suits: { S: [0, 4] as Range, H: [0, 4] as Range },
}

export const DEFAULT_TOPICS: Recipe[] = [
  {
    id: '1nt-opening',
    name: '1 Sanzatu açılışı',
    category: 'Açılışlar',
    description: "G: 15–17 HP, dengeli, 5'li majör yok.",
    dealer: 'S',
    seats: { S: ONE_NT_OPENER },
  },
  {
    id: '2nt-opening',
    name: '2 Sanzatu açılışı',
    category: 'Açılışlar',
    description: "G: 20–21 HP, dengeli, 5'li majör yok.",
    dealer: 'S',
    seats: { S: { hcp: [20, 21], shape: 'balanced', suits: { S: [0, 4], H: [0, 4] } } },
  },
  {
    id: '1-major-opening',
    name: '1 Majör açılış',
    category: 'Açılışlar',
    description: 'G: 12–21 HP, 5+ ♥ veya ♠.',
    dealer: 'S',
    seats: { S: { hcp: [12, 21], anySuit: { suits: ['S', 'H'], length: [5, 13] } } },
  },
  {
    id: 'weak-two',
    name: 'Zayıf iki açılış',
    category: 'Açılışlar',
    description: "G: 6–10 HP, 6'lı ♦, ♥ veya ♠.",
    dealer: 'S',
    seats: { S: { hcp: [6, 10], anySuit: { suits: ['D', 'H', 'S'], length: [6, 6] } } },
  },
  {
    id: 'stayman',
    name: 'Stayman',
    category: '1SA sonrası',
    description: "G: 1SA eli; K: 8+ HP, 4'lü majör.",
    dealer: 'S',
    seats: {
      S: ONE_NT_OPENER,
      N: {
        hcp: [8, 40],
        suits: { S: [0, 4], H: [0, 4] },
        anySuit: { suits: ['S', 'H'], length: [4, 4] },
      },
    },
  },
  {
    id: 'transfer',
    name: 'Transfer',
    category: '1SA sonrası',
    description: 'G: 1SA eli; K: 5+ majör.',
    dealer: 'S',
    seats: { S: ONE_NT_OPENER, N: { anySuit: { suits: ['S', 'H'], length: [5, 13] } } },
  },
  {
    id: 'takeout-double',
    name: 'Takeout kontr',
    category: 'Rekabet',
    description: 'D: 1♥ açılışı; G: 12+ HP, ♥ kısa, ♠ desteği.',
    dealer: 'E',
    seats: {
      E: { hcp: [12, 21], suits: { H: [5, 13] } },
      S: { hcp: [12, 21], suits: { H: [0, 1], S: [3, 5] } },
    },
  },
  {
    id: 'overcall',
    name: 'Renk müdahalesi',
    category: 'Rekabet',
    description: 'D: açılış; G: 8–16 HP, 5+ renk.',
    dealer: 'E',
    seats: {
      E: { hcp: [12, 21] },
      S: { hcp: [8, 16], anySuit: { suits: ['S', 'H', 'D', 'C'], length: [5, 13] } },
    },
  },
  {
    id: 'slam',
    name: 'Blackwood / şlem',
    category: 'Şlem',
    description: 'KG toplam 33+ HP, 8+ fit.',
    dealer: 'S',
    seats: {},
    pair: { NS: { hcp: [33, 40], fit: { length: [8, 13] } } },
  },
  {
    id: 'nt-play',
    name: 'Sanzatu oyun planı',
    category: 'Oyun',
    description: 'KG 25–27 HP, iki el dengeli.',
    dealer: 'S',
    seats: { N: { shape: 'balanced' }, S: { shape: 'balanced' } },
    pair: { NS: { hcp: [25, 27] } },
  },
]

/** Kategoriye göre gruplar, ilk görülme sırasını korur. */
export function groupByCategory(topics: readonly Recipe[]): [string, Recipe[]][] {
  const groups = new Map<string, Recipe[]>()
  for (const topic of topics) {
    const group = groups.get(topic.category)
    if (group) group.push(topic)
    else groups.set(topic.category, [topic])
  }
  return [...groups]
}
