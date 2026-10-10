// Tüm arayüz metinleri burada. Bileşenlerde doğrudan Türkçe metin yazılmaz.

const numberFormat = new Intl.NumberFormat('tr-TR')
const percentFormat = new Intl.NumberFormat('tr-TR', {
  style: 'percent',
  maximumSignificantDigits: 3,
})

export const tr = {
  appName: 'Briçhane',
  tagline: 'Konuya göre briç eli üretici',

  seats: { N: 'K', E: 'D', S: 'G', W: 'B' },
  seatNames: { N: 'Kuzey', E: 'Doğu', S: 'Güney', W: 'Batı' },
  vulnerability: { None: 'Zon yok', NS: 'KG zon', EW: 'DB zon', All: 'Herkes zon' },
  hcp: 'HP',

  generate: {
    title: 'El Atölyesi',
    topic: 'Konu',
    count: 'El sayısı',
    countInvalid: (max: number) => `1 ile ${max} arasında bir sayı girin.`,
    seed: 'Tohum',
    seedPlaceholder: 'Boş = rastgele',
    seedHelp: 'Aynı tohum aynı seti verir.',
    submit: 'Üret',
    cancel: 'Durdur',
    running: 'Üretiliyor…',
    progress: (found: number, count: number) => `${found} / ${count} el`,
    attempts: (attempts: number) => `${numberFormat.format(attempts)} deneme`,
    summary: (count: number) => `${count} board`,
    copySeed: 'Kopyala',
    copied: 'Kopyalandı',
    focusOnly: 'Sadece konu eli',
    exhausted: 'Bu koşulda el bulunamadı, aralıkları genişletin.',
    exhaustedPartial: (found: number, count: number) =>
      `İstenen ${count} elden yalnızca ${found} tanesi bulundu.`,
    observed: (probability: number, attempts: number) =>
      `Gözlenen olasılık: ${percentFormat.format(probability)} (${numberFormat.format(attempts)} denemede)`,
    error: 'Üretim sırasında hata oluştu:',
    empty: 'Bir konu seçip “Üret”e basın.',
  },

  board: {
    board: 'Board',
    dealer: 'Dağıtıcı',
    hidden: 'Gizli',
    open: 'Büyüt',
  },

  dealView: {
    close: 'Kapat',
    prev: 'Önceki',
    next: 'Sonraki',
    hand: 'El',
    shape: 'Dağılım',
    ltc: 'LTC',
    controls: 'Kontrol',
  },
} as const

export type Messages = typeof tr
