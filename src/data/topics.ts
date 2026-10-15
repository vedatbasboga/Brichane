// Varsayılan konu tarifleri. Aralıklar başlangıç değerleridir; hocanın sistemine göre düzeltilecek.
// Tarifler Güney dağıtıcıymış gibi yazılır; üretimde konu eli board'un dağıtıcısına çevrilir.

import {
  RANK_ACE,
  RANK_JACK,
  RANK_KING,
  RANK_QUEEN,
  RANK_TEN,
  type Recipe,
  type SeatConstraint,
} from '../engine'

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

  // Savunma apelleri (hocanın "Apeller" notu): nottaki her kural ayrı bir konu. Oynat konu
  // kontratıyla başlar; savunmacılar aynı sonucu veren kartlar arasından apel kartını oynar
  // (anlaşma Oynat'ta seçilir).

  // --- Sanzatuya karşı ---
  {
    // Sanzatuya As çıkışı: ortak Damı varsa büyük kartla beğenir, yoksa küçükle beğenmez.
    id: 'signal-attitude-nt',
    name: 'Tutum apeli: sanzatuya As çıkışı',
    category: 'Savunma: apeller',
    description:
      "Kontrat 3NT. Çıkan: en uzun rengi 5–6'lı, başında AK; As ile çıkar. Çıkanın ortağı tutum apeli verir (Dam varsa beğenir). Deklare tarafı 25–28 HP, dengeli.",
    dealer: 'S',
    topicSuit: { suits: ['S', 'H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'N', level: 3, lead: 'top' },
    seats: {
      N: { shape: ['balanced', 'semi-balanced'] },
      S: { shape: 'balanced' },
      W: { topicSuit: [5, 6], topicSuitCards: [RANK_ACE, RANK_KING], topicSuitLongest: true },
    },
    pair: { NS: { hcp: [25, 28] } },
  },
  {
    // Sanzatuya Dam çıkışı (QJ10'dan): ortak As ya da Papazı varsa beğenir.
    id: 'signal-attitude-nt-queen',
    name: 'Tutum apeli: sanzatuya Dam çıkışı',
    category: 'Savunma: apeller',
    description:
      "Kontrat 3NT. Çıkan: en uzun rengi 5–6'lı, başında QJ10 (As ve Papaz yok); Dam ile çıkar. Çıkanın ortağı tutum apeli verir (As ya da Papaz varsa beğenir). Deklare tarafı 25–28 HP, dengeli.",
    dealer: 'S',
    topicSuit: { suits: ['S', 'H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'N', level: 3, lead: 'top' },
    seats: {
      N: { shape: ['balanced', 'semi-balanced'] },
      S: { shape: 'balanced' },
      W: {
        topicSuit: [5, 6],
        topicSuitHcp: [3, 3],
        topicSuitCards: [RANK_QUEEN, RANK_JACK, RANK_TEN],
        topicSuitLongest: true,
      },
    },
    pair: { NS: { hcp: [25, 28] } },
  },
  {
    // Rua çıkışa As ile alınır, renk sayıyla dönülür: 2 kart kaldıysa büyüğü, 3+ ise baştaki 4. kart.
    id: 'signal-small-lead-return',
    name: 'Rua çıkış: As ile alıp sayıyla dönüş',
    category: 'Savunma: apeller',
    description:
      "Kontrat 3NT. Çıkan: en uzun rengi 5–6'lı, Ası yok; yukarıdan 4. kartla (rua) çıkar. Çıkanın ortağı: o rengin Ası ve 2–4 kart; Asla alır, rengi sayıyla döner. Deklare tarafı 24–27 HP, dengeli.",
    dealer: 'S',
    topicSuit: { suits: ['S', 'H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'N', level: 3, lead: 'fourth' },
    seats: {
      N: { shape: ['balanced', 'semi-balanced'] },
      E: { topicSuit: [2, 4], topicSuitCards: [RANK_ACE] },
      S: { shape: 'balanced' },
      W: { topicSuit: [5, 6], topicSuitLongest: true },
    },
    pair: { NS: { hcp: [24, 27] } },
  },
  {
    // Yerde KQJ'li uzun renk, girişi yok: ortağın sayı apeli Ası ne zaman alacağını söyler.
    id: 'signal-count-holdup',
    name: 'Sayı apeli: As tutma',
    category: 'Savunma: apeller',
    description:
      "Kontrat 3NT. Yer: KQJ'li 5–6'lı renk, 6–10 HP (dışarıda girişi az). Savunmacılardan biri: o rengin Ası ve 2–4 kart; diğeri 2–4 kartla sayı apeli verir, Ası tutan doğru turda alır. Deklare tarafı 23–28 HP.",
    dealer: 'S',
    topicSuit: { suits: ['S', 'H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'N', level: 3 },
    seats: {
      N: {
        hcp: [6, 10],
        topicSuit: [5, 6],
        topicSuitCards: [RANK_KING, RANK_QUEEN, RANK_JACK],
      },
      E: { topicSuit: [2, 4], topicSuitCards: [RANK_ACE] },
      S: { shape: ['balanced', 'semi-balanced'], topicSuit: [2, 3] },
      W: { topicSuit: [2, 4] },
    },
    pair: { NS: { hcp: [23, 28] } },
  },
  {
    // Notun "üç kart varsa en küçük, 4 kart varsa 4.'sü" kısmı: Astan sonra 3–4 kart kalır.
    id: 'signal-return-count-nt',
    name: 'Sanzatuda sayıyla dönüş: 3 ve 4 kart',
    category: 'Savunma: apeller',
    description:
      "Kontrat 3NT. Çıkan: en uzun rengi 4–5'li, Ası yok; yukarıdan 4. kartla (rua) çıkar. Çıkanın ortağı: o rengin Ası ve 4–5 kart; Asla alır, rengi sayıyla döner (3 kart kaldıysa en küçüğü, 4 kart kaldıysa rengin baştan 4. kartı). Deklare tarafı 24–27 HP, dengeli.",
    dealer: 'S',
    topicSuit: { suits: ['S', 'H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'N', level: 3, lead: 'fourth' },
    seats: {
      N: { shape: ['balanced', 'semi-balanced'] },
      E: { topicSuit: [4, 5], topicSuitCards: [RANK_ACE] },
      S: { shape: 'balanced' },
      W: { topicSuit: [4, 5], topicSuitLongest: true },
    },
    pair: { NS: { hcp: [24, 27] } },
  },

  // --- Koz oyununa karşı ---
  {
    // Koza karşı As çıkışı, yerde onörlü 2+ kart: sayı apeli.
    id: 'signal-ace-lead-trump',
    name: 'Koza karşı As çıkışı: sayı apeli',
    category: 'Savunma: apeller',
    description:
      "Kontrat 4♠. Çıkan: en uzun rengi 4–6'lı yan renk, başında AK; As ile çıkar. Yerde bu renkte 2–6 kart, Dam ya da Vale ile. Çıkanın ortağı sayı apeli verir. Deklare tarafı 23–30 HP, ♠ fiti 8+.",
    dealer: 'S',
    topicSuit: { suits: ['H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'S', level: 4, lead: 'top' },
    seats: {
      N: { topicSuit: [2, 6], topicSuitHcp: [1, 3] },
      S: { suits: { S: [5, 7] } },
      W: { topicSuit: [4, 6], topicSuitCards: [RANK_ACE, RANK_KING], topicSuitLongest: true },
    },
    pair: { NS: { hcp: [23, 30], fit: { suits: ['S'], length: [8, 11] } } },
  },
  {
    // Koza karşı As çıkışı, yerde 3 boş kart (10'dan küçük): tutum apeli.
    id: 'signal-attitude-trump',
    name: 'Tutum apeli: koza karşı As çıkışı, yerde 3 boş kart',
    category: 'Savunma: apeller',
    description:
      "Kontrat 4♠. Çıkan: en uzun rengi 4–6'lı yan renk, başında AK; As ile çıkar. Yerde bu renkte 3 boş kart (10'dan küçük). Çıkanın ortağı tutum apeli verir (Dam ya da ikili varsa beğenir). Deklare tarafı 23–30 HP, ♠ fiti 8+.",
    dealer: 'S',
    topicSuit: { suits: ['H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'S', level: 4, lead: 'top' },
    seats: {
      N: { topicSuit: [3, 3], topicSuitHcp: [0, 0], exclude: [{ topicSuitCards: [RANK_TEN] }] },
      S: { suits: { S: [5, 7] } },
      W: { topicSuit: [4, 6], topicSuitCards: [RANK_ACE, RANK_KING], topicSuitLongest: true },
    },
    pair: { NS: { hcp: [23, 30], fit: { suits: ['S'], length: [8, 11] } } },
  },
  {
    // Koza karşı As çıkışı, yerde tek kart (yer çakacak): sayıya gerek yok, renk tercihi.
    id: 'signal-suit-preference-trump',
    name: 'Renk tercihi: koza karşı As çıkışı, yer çakacak',
    category: 'Savunma: apeller',
    description:
      "Kontrat 4♠. Çıkan: en uzun rengi 4–6'lı yan renk, başında AK; As ile çıkar. Yerde bu renkte tek kart: sayıya gerek yok, çıkanın ortağı renk tercihi verir (büyük kart kalan iki renkten büyüğünü, küçük kart küçüğünü ister). Deklare tarafı 23–30 HP, ♠ fiti 8+.",
    dealer: 'S',
    topicSuit: { suits: ['H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'S', level: 4, lead: 'top' },
    seats: {
      N: { topicSuit: [1, 1] },
      S: { suits: { S: [5, 7] } },
      W: { topicSuit: [4, 6], topicSuitCards: [RANK_ACE, RANK_KING], topicSuitLongest: true },
    },
    pair: { NS: { hcp: [23, 30], fit: { suits: ['S'], length: [8, 11] } } },
  },
  {
    // Koz oyunlarında da ortağın rengi sayıyla dönülür.
    id: 'signal-return-count-trump',
    name: 'Koza karşı sayıyla dönüş',
    category: 'Savunma: apeller',
    description:
      "Kontrat 4♠. Çıkan: en uzun rengi 4–5'li yan renk, Ası yok; yukarıdan 4. kartla çıkar. Çıkanın ortağı: o rengin Ası ve 3–5 kart; Asla alıp rengi sayıyla döner (2 kart kaldıysa büyüğü, 3 kart kaldıysa en küçüğü, 4 kart kaldıysa rengin baştan 4. kartı). Deklare tarafı 22–28 HP, ♠ fiti 8+.",
    dealer: 'S',
    topicSuit: { suits: ['H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'S', level: 4, lead: 'fourth' },
    seats: {
      N: { topicSuit: [2, 4] },
      E: { topicSuit: [3, 5], topicSuitCards: [RANK_ACE] },
      S: { suits: { S: [5, 7] } },
      W: { topicSuit: [4, 5], topicSuitLongest: true },
    },
    pair: { NS: { hcp: [22, 28], fit: { suits: ['S'], length: [8, 10] } } },
  },
  {
    // Ortak tek kartla çıkar; Ası olan alıp rengi çaktırır, verdiği kartla dönüş rengini ister.
    id: 'signal-suit-preference-ruff',
    name: 'Renk tercihi: çaktırma',
    category: 'Savunma: apeller',
    description:
      'Kontrat 4♠. Çıkan: yan renkte (♥, ♦ ya da ♣) tek kart, 1–3 koz; tek kartıyla çıkar. Çıkanın ortağı: o rengin Ası ve 4+ kart; Asla alıp rengi çaktırır, verdiği kartın büyüklüğüyle hangi renkten dönülmesini istediğini gösterir. Deklare tarafı 22–28 HP, ♠ fiti 8+.',
    dealer: 'S',
    topicSuit: { suits: ['H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'S', level: 4, lead: 'top' },
    seats: {
      E: { topicSuit: [4, 7], topicSuitCards: [RANK_ACE] },
      S: { suits: { S: [5, 7] } },
      W: { suits: { S: [1, 3] }, topicSuit: [1, 1] },
    },
    pair: { NS: { hcp: [22, 28], fit: { suits: ['S'], length: [8, 10] } } },
  },

  // --- Defos ---
  {
    // Yerin uzun rengi akarken savunmacılar defos yapar; ilk defos istenen rengi gösterir.
    id: 'signal-discards',
    name: 'Defos: Roman',
    category: 'Savunma: apeller',
    description:
      "Kontrat 3NT. Yer: AKQ'lu 6–7'li renk; deklare bu rengi akıtınca savunmacılar defos yapar. İlk defos Roman (tek/çift) anlaşmasıyla istenen rengi gösterir: tek sayı o rengi ister, küçük çift (2, 4) kalan renklerden düşüğünü, büyük çift (8, 10) büyüğünü. Oynat'ta defos anlaşması Roman seçili olmalı. Deklare tarafı 24–28 HP.",
    dealer: 'S',
    topicSuit: { suits: ['S', 'H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'N', level: 3 },
    seats: {
      N: { topicSuit: [6, 7], topicSuitCards: [RANK_ACE, RANK_KING, RANK_QUEEN] },
      S: { shape: ['balanced', 'semi-balanced'], topicSuit: [1, 3] },
    },
    pair: { NS: { hcp: [24, 28] } },
  },
  {
    // Notun Lavinthal örnekleri koz kontratında: koz ve oynanan renk dışındaki iki renk.
    id: 'signal-discards-lavinthal',
    name: 'Defos: Lavinthal',
    category: 'Savunma: apeller',
    description:
      "Kontrat 4♠. Yer: AKQ'lu 5–6'lı yan renk; deklare bu rengi akıtınca savunmacılar defos yapar. İlk defos Lavinthal anlaşmasıyla istenen rengi gösterir: koz ve oynanan renk dışındaki iki renkten küçük kart düşüğünü, büyük kart büyüğünü ister. Oynat'ta defos anlaşması Lavinthal seçilmeli. Deklare tarafı 24–28 HP, ♠ fiti 8+.",
    dealer: 'S',
    topicSuit: { suits: ['H', 'D', 'C'] },
    contract: { declarer: 'S', strain: 'S', level: 4 },
    seats: {
      N: { topicSuit: [5, 6], topicSuitCards: [RANK_ACE, RANK_KING, RANK_QUEEN] },
      S: { suits: { S: [5, 7] }, topicSuit: [1, 2] },
    },
    pair: { NS: { hcp: [24, 28], fit: { suits: ['S'], length: [8, 10] } } },
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
