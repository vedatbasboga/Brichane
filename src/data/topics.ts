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
    // 1♣ – ?: cevapçı oyun zorlaması yoksa ♦'ı atlayıp 4'lü majörünü söyler.
    id: 'walsh',
    name: 'Walsh',
    category: 'Açılış konvansiyonları',
    description:
      "Açan: 1♣ (12–21 HP, 3+♣, ♦ en fazla 3, 5'li majör yok, 1NT/2NT eli değil); ortağı: 6–11 HP, 4–5'li ♦ ve 4'lü majör.",
    dealer: 'S',
    seats: {
      S: {
        hcp: [12, 21],
        suits: { S: [0, 4], H: [0, 4], D: [0, 3], C: [3, 13] },
        exclude: [
          { hcp: [15, 17], shape: 'balanced' },
          { hcp: [20, 21], shape: 'balanced' },
        ],
      },
      N: {
        hcp: [6, 11],
        suits: { S: [0, 4], H: [0, 4], D: [4, 5] },
        anySuit: { suits: ['S', 'H'], length: [4, 4] },
      },
    },
  },
  {
    // 4♣ = güçlü 4♥, 4♦ = güçlü 4♠: düz 4M barajından iyi, 2♣'tan zayıf.
    id: 'namyats',
    name: 'Namyats',
    category: 'Açılış konvansiyonları',
    description:
      "Açan: 7–8'li majör, renkte AK ya da AQJ (7+ HP), 11–16 HP, 4 kaybeden (yaklaşık 9 oyun lövesi).",
    dealer: 'S',
    topicSuit: { suits: ['S', 'H'] },
    seats: {
      S: {
        hcp: [11, 16],
        topicSuit: [7, 8],
        topicSuitHcp: [7, 10],
        topicSuitLongest: true,
        ltc: [4, 4],
      },
    },
  },
  {
    // 3NT: AKQ'lu 7–8'li minör, dışarıda as/papaz yok (kontrol 3 = renkteki A ve K).
    id: 'gambling-3nt',
    name: 'Gambling 3NT',
    category: 'Açılış konvansiyonları',
    description: "Açan: AKQ'lu 7–8'li minör; dışarıda as ya da papaz yok.",
    dealer: 'S',
    topicSuit: { suits: ['D', 'C'] },
    seats: { S: { topicSuit: [7, 8], topicSuitHcp: [9, 10], controls: [3, 3] } },
  },
  {
    id: 'stayman',
    name: 'Stayman',
    category: 'Sanzatu açılışı sonrası',
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
    name: 'Jacoby transfer',
    category: 'Sanzatu açılışı sonrası',
    description: 'Açan: 1NT eli; ortağı: 5+ majör.',
    dealer: 'S',
    seats: { S: ONE_NT_OPENER, N: { anySuit: { suits: ['S', 'H'], length: [5, 13] } } },
  },
  {
    // 1NT – 4♦/4♥: 4♥/4♠'a transfer; manş var, şlem yok.
    id: 'texas-transfer',
    name: 'Texas transfer',
    category: 'Sanzatu açılışı sonrası',
    description: "Açan: 1NT eli; ortağı: 6–7'li majör, 10–14 HP (manş var, şlem yok).",
    dealer: 'S',
    seats: {
      S: ONE_NT_OPENER,
      N: { hcp: [10, 14], anySuit: { suits: ['S', 'H'], length: [6, 7] } },
    },
  },
  {
    // 2NT – 3♣: açanın 4'lü ya da 5'li majörü sorulur (2NT 5'li majörle açılabilir).
    id: 'puppet-stayman',
    name: 'Puppet Stayman',
    category: 'Sanzatu açılışı sonrası',
    description:
      "Açan: 2NT (20–21 HP, dengeli), 4–5'li majör; ortağı: 4–10 HP, 3–4'lü majör (5'li majör yok).",
    dealer: 'S',
    seats: {
      S: { hcp: [20, 21], shape: 'balanced', anySuit: { suits: ['S', 'H'], length: [4, 5] } },
      N: {
        hcp: [4, 10],
        suits: { S: [0, 4], H: [0, 4] },
        anySuit: { suits: ['S', 'H'], length: [3, 4] },
      },
    },
  },
  {
    // Temel Lebensohl (öğretim sürümü): 1NT – (2♦/2♥/2♠) – ?
    // Cevapçının hep 6'lı rengi var: zayıfsa (0–7) rengini oynar — 2'de söylenemiyorsa
    // 2NT → 3♣ → pas/düzelt; manş gücündeyse (10–15) rengini 3. seviyede söyler.
    // Davet (8–9), dengeli manş eli (stoper sorusu: 3NT hızlı/yavaş), cezalı kontr
    // (rakip renginde 3+) ve şlem elleri ileri konu olduğu için üretilmez.
    // 2♣ müdahalesi yok sayılır (1NT – Pas gibi), bu yüzden konu rengi ♦ ♥ ♠.
    id: 'lebensohl',
    name: 'Lebensohl',
    category: 'Sanzatu açılışı sonrası',
    description:
      "Açan: 1NT eli; rakip 2♦/2♥/2♠ ile girer (8–15 HP, 5+); ortağı: 6'lı renk, rakibin renginde en fazla 2; ya zayıf (0–7 HP) ya da manş gücünde (10–15 HP).",
    dealer: 'S',
    topicSuit: { suits: ['S', 'H', 'D'] },
    seats: {
      S: ONE_NT_OPENER,
      W: { hcp: [8, 15], topicSuit: [5, 13], topicSuitLongest: true },
      N: {
        hcp: [0, 15],
        anySuit: { suits: ['S', 'H', 'D', 'C'], length: [6, 13] },
        topicSuit: [0, 2],
        // Davet aralığı: 2NT'den sonra rakibin renginden yüksek renk gibi ince ayrımlar.
        exclude: [{ hcp: [8, 9] }],
      },
    },
  },
  {
    // 1M – 2M – 3x: açan zayıf yan rengini (yardım rengi) söyleyerek manşa davet eder.
    id: 'trial-bid',
    name: 'Trial bid',
    category: 'Açılış sonrası',
    description:
      "1♥/1♠ – 2♥/2♠ sonrası manş daveti. Açan: 15–18 HP, 5–6'lı majör, 6 kaybeden; ortağı: 6–9 HP, majörde 3–4'lü destek.",
    dealer: 'S',
    topicSuit: { suits: ['S', 'H'] },
    seats: {
      S: { hcp: [15, 18], topicSuit: [5, 6], topicSuitLongest: true, ltc: [6, 6] },
      N: { hcp: [6, 9], topicSuit: [3, 4] },
    },
  },
  {
    // Temel Check Back Stayman (öğretim sürümü): 1♣/1♦ – 1M – 1NT – 2♣
    // Cevapçı tam 5'li majörüyle 3'lü destek arar; açan 3'lü destekle 2M, yoksa 2♦ der.
    // Diğer majörde 4'lü (açanın 4'lü ♥'ı, cevapçının 5-4 majörü), ikinci 5'li renk, 6'lı majör
    // ve şlem elleri ileri konu olduğu için üretilmez.
    id: 'check-back-stayman',
    name: 'Check Back Stayman',
    category: 'Açılış sonrası',
    description:
      "Açan: 1♣/1♦ açıp 1NT ile tekrar eder (12–14 HP, dengeli, iki majörde de en fazla 3); ortağı: 11–15 HP, tam 5'li majör, diğer majörde en fazla 3, minörlerde en fazla 4.",
    dealer: 'S',
    topicSuit: { suits: ['S', 'H'] },
    seats: {
      S: { hcp: [12, 14], shape: 'balanced', suits: { S: [0, 3], H: [0, 3] } },
      N: {
        hcp: [11, 15],
        suits: { D: [0, 4], C: [0, 4] },
        // Konu majörü tam 5'li olduğundan diğer majör en fazla 3'lü olur.
        anySuit: { suits: ['S', 'H'], length: [0, 3] },
        topicSuit: [5, 5],
      },
    },
  },
  {
    // 1♣/1♦ – 1M – 2NT – 3♣ (3♦ ister): zayıf cevapçı 3♦'ta ya da 3M'de durur.
    id: 'wolff-sign-off',
    name: 'Wolff sign-off',
    category: 'Açılış sonrası',
    description:
      "Açan: 1♣/1♦ açıp 2NT ile tekrar eder (18–19 HP, dengeli, majörlerde en fazla 3); ortağı: 1♥/1♠ cevabı, 4–7 HP, 5–6'lı majör.",
    dealer: 'S',
    topicSuit: { suits: ['S', 'H'] },
    seats: {
      S: { hcp: [18, 19], shape: 'balanced', suits: { S: [0, 3], H: [0, 3] } },
      N: { hcp: [4, 7], topicSuit: [5, 6], topicSuitLongest: true },
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
    // 2♣ tek renk, 2♦ majörler, 2♥/2♠ majör + minör, 2NT minörler (5-5).
    id: 'cappelletti',
    name: 'Cappelletti',
    category: "1NT'ye müdahale",
    description:
      'Rakip 1NT açar (15–17); müdahale eden: 8–15 HP, dengeli değil; 6+ tek renk ya da en az 5-4 iki renk (5-4 minörler hariç).',
    dealer: 'E',
    seats: {
      E: ONE_NT_OPENER,
      S: {
        hcp: [8, 15],
        anySuit: { suits: ['S', 'H', 'D', 'C'], length: [5, 13] },
        exclude: [
          { shape: 'balanced' },
          // 5-4 minörlerin Cappelletti'de karşılığı yok (2NT 5-5 ister).
          { suits: { S: [0, 3], H: [0, 3], D: [4, 4], C: [5, 5] } },
          { suits: { S: [0, 3], H: [0, 3], D: [5, 5], C: [4, 4] } },
        ],
      },
    },
  },
  {
    // 2♣ majörler, 2♦ 6'lı tek majör, 2♥/2♠ majör + minör.
    id: 'multi-landy',
    name: 'Multi-Landy',
    category: "1NT'ye müdahale",
    description:
      'Rakip 1NT açar (15–17); müdahale eden: 8–15 HP, 5+ majör, dengeli değil (6+ majör ya da majör + ikinci renk).',
    dealer: 'E',
    seats: {
      E: ONE_NT_OPENER,
      S: {
        hcp: [8, 15],
        anySuit: { suits: ['S', 'H'], length: [5, 13] },
        exclude: [{ shape: 'balanced' }],
      },
    },
  },
  {
    // Kontr tek renk, 2♣/2♦/2♥ o renk + üst renk, 2♠ doğal.
    id: 'dont',
    name: 'DONT',
    category: "1NT'ye müdahale",
    description:
      'Rakip 1NT açar (15–17); müdahale eden: 8–15 HP, dengeli değil; 6+ tek renk ya da en az 5-4 iki renk.',
    dealer: 'E',
    seats: {
      E: ONE_NT_OPENER,
      S: {
        hcp: [8, 15],
        anySuit: { suits: ['S', 'H', 'D', 'C'], length: [5, 13] },
        exclude: [{ shape: 'balanced' }],
      },
    },
  },
  {
    // 2♣ iki majör.
    id: 'landy',
    name: 'Landy',
    category: "1NT'ye müdahale",
    description: 'Rakip 1NT açar (15–17); müdahale eden: 8–15 HP, iki majörde en az 5-4.',
    dealer: 'E',
    seats: {
      E: ONE_NT_OPENER,
      S: {
        hcp: [8, 15],
        suits: { S: [4, 13], H: [4, 13] },
        anySuit: { suits: ['S', 'H'], length: [5, 13] },
      },
    },
  },
  {
    // 1♣/1♦ – 2♣/2♦: iki majör.
    id: 'michaels-minor',
    name: 'Michaels cue-bid (minör açılışa)',
    category: 'İki renkli müdahale',
    description: 'Rakip 1♣/1♦ açar (5+); müdahale eden: 8–16 HP, iki majörde 5-5.',
    dealer: 'E',
    topicSuit: { suits: ['D', 'C'] },
    seats: {
      E: { hcp: [12, 21], topicSuit: [5, 13], topicSuitLongest: true },
      S: { hcp: [8, 16], suits: { S: [5, 13], H: [5, 13] } },
    },
  },
  {
    // 1♥/1♠ – 2♥/2♠: diğer majör + bir minör.
    id: 'michaels-major',
    name: 'Michaels cue-bid (majör açılışa)',
    category: 'İki renkli müdahale',
    description: 'Rakip 1♥/1♠ açar (5+); müdahale eden: 8–16 HP, diğer majörde ve bir minörde 5-5.',
    dealer: 'E',
    topicSuit: { suits: ['S', 'H'] },
    seats: {
      E: { hcp: [12, 21], topicSuit: [5, 13], topicSuitLongest: true },
      S: {
        hcp: [8, 16],
        // Açılan renkte en fazla 3: 5'li majör diğer majör olur.
        topicSuit: [0, 3],
        anySuit: { suits: ['D', 'C'], length: [5, 13] },
        exclude: [{ suits: { S: [0, 4], H: [0, 4] } }],
      },
    },
  },
  {
    // 1♣/1♦ – 2NT: açılmamış en alçak iki renk (♥ + diğer minör).
    id: 'unusual-nt-minor',
    name: 'Unusual 2NT (minör açılışa)',
    category: 'İki renkli müdahale',
    description: 'Rakip 1♣/1♦ açar (5+); müdahale eden: 8–16 HP, ♥ ve diğer minörde 5-5.',
    dealer: 'E',
    topicSuit: { suits: ['D', 'C'] },
    seats: {
      E: { hcp: [12, 21], topicSuit: [5, 13], topicSuitLongest: true },
      S: {
        hcp: [8, 16],
        // Açılan renkte en fazla 3: 5'li minör diğer minör olur.
        topicSuit: [0, 3],
        suits: { H: [5, 13] },
        anySuit: { suits: ['D', 'C'], length: [5, 13] },
      },
    },
  },
  {
    // 1♥/1♠ – 2NT: iki minör.
    id: 'unusual-nt-major',
    name: 'Unusual 2NT (majör açılışa)',
    category: 'İki renkli müdahale',
    description: 'Rakip 1♥/1♠ açar (5+); müdahale eden: 8–16 HP, iki minörde 5-5.',
    dealer: 'E',
    topicSuit: { suits: ['S', 'H'] },
    seats: {
      E: { hcp: [12, 21], topicSuit: [5, 13], topicSuitLongest: true },
      S: { hcp: [8, 16], suits: { D: [5, 13], C: [5, 13] } },
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
    // 1NT – 4♣: as sorusu; ortaklık 31+ HP, fit aranmaz, 6NT/7NT kararı.
    id: 'gerber',
    name: 'Gerber',
    category: 'Şlem',
    description: 'Açan: 1NT eli; ortağı: 16–19 HP, dengeli (ortaklık 31–36 HP, sanzatu şlemi).',
    dealer: 'S',
    seats: { S: ONE_NT_OPENER, N: { hcp: [16, 19], shape: 'balanced' } },
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
