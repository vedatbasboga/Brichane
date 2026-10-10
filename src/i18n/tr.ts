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
  pairs: { NS: 'KG', EW: 'DB' },
  suitNames: { S: 'Pik', H: 'Kupa', D: 'Karo', C: 'Sinek' },
  shapes: { balanced: 'Dengeli', 'semi-balanced': 'Yarı dengeli', unbalanced: 'Dengesiz' },

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
    customGroup: 'Özel',
    customOption: 'Özel dağılım…',
    customTitle: 'Özel dağılım',
    customHelp:
      'Bu dağılım kaydedilmez; yalnızca şu anki üretim için kullanılır. Seçili konunun ayarlarıyla başlar.',
    customSummary: 'Kendi belirlediğiniz koşullar.',
    customEdit: 'Ayarları düzenle',
    customApply: 'Uygula',
    customCancel: 'Vazgeç',
    customReset: 'Tüm koşulları temizle',
    customFixErrors: 'Uygulamadan önce şunları düzeltin:',
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

  editor: {
    general: 'Genel ayarlar',
    dealer: 'Tarifin dağıtıcısı',
    dealerHelp: 'Elleri bu koltuk dağıtıcıymış gibi tanımlayın.',
    placement: 'Konu elinin yeri',
    placementBalanced: 'Dört koltuğa dengeli dağıt (önerilen)',
    placementFixed: 'Tarifteki koltukta sabit tut',
    placementHelp:
      "Dengeli: tarifin dağıtıcısı board'un dağıtıcısına çevrilir; 16 board'da konu eli her koltuğa 4 kez düşer.",
    topicSuit: 'Konu rengi',
    topicSuitHelp:
      'Birden fazla eli aynı renge bağlamak için (örn. rakibin açtığı renk). Seçilen renklerden biri konu rengi olur; ellerde "Konu rengindeki uzunluk" ile kullanılır.',
    seatEnabled: 'Bu ele koşul koy',
    hcp: 'HP',
    shape: 'Dağılım',
    shapeHelp: 'Hiçbiri seçilmezse dağılım fark etmez.',
    suitLengths: 'Renk uzunlukları',
    anySuit: 'Şu renklerden en az biri',
    anySuitLength: 'Uzunluğu',
    topicSuitLength: 'Konu rengindeki uzunluk',
    advanced: 'Gelişmiş',
    controls: 'Kontrol (A=2, K=1)',
    ltc: 'Kaybeden löve (LTC)',
    exclude: 'Hariç tut',
    excludeHelp: 'El bunlardan birine uyuyorsa kullanılmaz (örn. 1SA eli).',
    addExclude: 'Hariç tutma ekle',
    remove: 'Kaldır',
    pairSection: (pair: string) => `${pair} ortaklığı`,
    pairEnabled: 'Bu ortaklığa koşul koy',
    pairHcp: 'Toplam HP',
    fit: 'Ortak fit uzunluğu',
    fitSuits: 'Fit renkleri (hiçbiri seçilmezse herhangi biri)',
    min: 'En az',
    max: 'En çok',
    errors: {
      range: (where: string, field: string) =>
        `${where} — ${field}: en az değeri en çok değerinden büyük olamaz.`,
      suitMinSum: (where: string) => `${where}: renklerin en az uzunlukları toplamı 13'ü geçemez.`,
      suitMaxSum: (where: string) =>
        `${where}: renklerin en çok uzunlukları toplamı 13'ten az olamaz.`,
      topicSuitMissing: 'Konu rengindeki uzunluk koşulu var ama konu rengi seçilmedi.',
    },
  },
} as const

export type Messages = typeof tr
