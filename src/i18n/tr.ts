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

  nav: {
    label: 'Ana gezinme',
    generate: 'El Atölyesi',
    sets: 'Setlerim',
  },

  generate: {
    title: 'El Atölyesi',
    topic: 'Konu',
    count: 'El sayısı',
    countInvalid: (max: number) => `1 ile ${max} arasında bir sayı girin.`,
    submit: 'Üret',
    cancel: 'Durdur',
    running: 'Üretiliyor…',
    progress: (found: number, count: number) => `${found} / ${count} el`,
    attempts: (attempts: number) => `${numberFormat.format(attempts)} deneme`,
    summary: (count: number) => `${count} board`,
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

  share: {
    button: 'Bağlantıyı paylaş',
    copied: 'Bağlantı kopyalandı',
    copyPrompt: 'Bağlantıyı kopyalayın:',
    invalid: 'Bağlantı geçersiz ya da eksik. Yeni bir set üretebilirsiniz.',
    topicChanged:
      'Bu konu, bağlantı oluşturulduktan sonra güncellendi; eller bağlantıyı gönderenin gördüğünden farklı olabilir.',
    versionChanged: 'Bu bağlantı programın eski bir sürümüyle oluşturuldu; eller farklı olabilir.',
  },

  save: {
    button: 'Kaydet',
    title: 'Seti kaydet',
    setTitle: 'Set adı',
    notes: 'Genel not (isteğe bağlı)',
    notesPlaceholder: 'Örn. 3. ders, 1NT sonrası Stayman pratiği',
    submit: 'Kaydet',
    saving: 'Kaydediliyor…',
    cancel: 'Vazgeç',
    titleRequired: 'Set adı boş olamaz.',
    saved: 'Set kaydedildi.',
    open: 'Setlerim’de aç',
    error: 'Kaydedilemedi:',
  },

  dd: {
    title: 'Çift kukla analizi',
    help: 'Dört el açık ve hatasız oyunla her deklarenin her kozda yapabileceği en yüksek kontrat (–: kontrat çıkmaz). Sarı: par kontrat.',
    computing: 'Çift kukla hesaplanıyor…',
    progress: (done: number, total: number) => `Çift kukla: ${done}/${total}`,
    par: 'Par',
    passOut: 'Pas',
    error: 'Çift kukla hesaplanamadı:',
  },

  play: {
    button: (contract: string) => `Oynat · ${contract}`,
    contract: (contract: string, declarer: string, leader: string) =>
      `${contract} · Deklare ${declarer} · Çıkış ${leader}`,
    trick: (trick: number) => `Löve ${trick} / 13`,
    score: (ns: number, ew: number) => `KG ${ns} – DB ${ew}`,
    computing: 'Oyun hesaplanıyor…',
    error: 'Oyun hesaplanamadı:',
    first: 'Başa',
    prev: 'Geri',
    next: 'İleri',
    auto: 'Otomatik oynat',
    pause: 'Durdur',
    exit: 'Analize dön',
    start: (leader: string) => `Çıkışı ${leader} yapar. Başlamak için “İleri”ye basın.`,
    played: (seat: string) => `${seat} oynadı:`,
    critical: 'Kritik hamle',
    criticalHelp: 'Yalnızca bu kart en iyi sonucu korur.',
    alternatives: 'Aynı sonucu veren diğer kartlar:',
    forced: 'Tek seçenek.',
    trickWon: (seat: string) => `Löveyi ${seat} aldı.`,
    result: (declarer: string, tricks: number, outcome: string) =>
      `Sonuç: ${declarer} ${tricks} löve aldı — ${outcome}.`,
    made: 'tam yaptı',
    over: (n: number) => `${n} fazla`,
    down: (n: number) => `${n} batık`,
    note: 'Çift kukla oyunu kartların yerini bilerek oynar: gösterilen yol en iyi sonuca giden yollardan biridir, masadaki “doğru oyun” her zaman bu olmayabilir. Kritik hamleler, gerçekten fark yaratan kartlardır.',
    selectHint: 'Başka bir kontratı oynatmak için tablodaki bir hücreye tıklayın.',
  },

  pbn: {
    download: 'PBN indir',
    help: 'Bridge Composer, BBO ve kart dağıtma makineleri için PBN dosyası',
  },

  pdf: {
    download: 'PDF indir',
    preparing: 'Hazırlanıyor…',
    error: 'PDF oluşturulamadı:',
    topic: 'Konu',
    page: (page: number, pages: number) => `Sayfa ${page}/${pages}`,
  },

  sets: {
    title: 'Setlerim',
    loading: 'Setler yükleniyor…',
    loadError: 'Setler yüklenemedi:',
    empty: 'Henüz kayıtlı set yok. El Atölyesi’nde bir set üretip “Kaydet”e basın.',
    showArchived: 'Arşivlenenleri göster',
    archived: 'Arşivde',
    boards: (count: number) => `${count} board`,
    open: 'Aç',
    copy: 'Kopyala',
    archive: 'Arşivle',
    unarchive: 'Arşivden çıkar',
    delete: 'Sil',
    confirmDelete: (title: string) => `“${title}” silinsin mi? Bu işlem geri alınamaz.`,
    copySuffix: ' (kopya)',
    copied: 'Kopya oluşturuldu.',
    notFound: 'Set bulunamadı.',
    back: 'Setlerim',
    setTitle: 'Set adı',
    notes: 'Genel not',
    saveChanges: 'Değişiklikleri kaydet',
    saving: 'Kaydediliyor…',
    savedChanges: 'Kaydedildi.',
    topic: 'Konu',
    created: 'Oluşturulma',
    boardNote: 'Board notu',
    boardNotePlaceholder: 'Örn. oyun planı, ideal açış, dikkat edilecek nokta',
    saveBoardNote: 'Notu kaydet',
    boardNoteSaved: 'Not kaydedildi.',
    hasNote: 'Not var',
    actionError: 'İşlem başarısız:',
  },

  about: {
    link: 'Hakkında',
    title: 'Hakkında',
    intro:
      'Briçhane, briç derslerinde kullanılmak üzere konuya göre el üreten, çift kukla analizi yapan ve setleri PDF olarak veren bir uygulamadır.',
    creditsTitle: 'Kullanılan açık kaynak yazılımlar',
    dds: 'Çift kukla analizi: DDS (Double Dummy Solver), Bo Haglund ve Søren Hein — Apache 2.0 lisansı.',
    ddsJs: 'DDS’in WebAssembly sürümü: bridge-dds, Christopher Book — Apache 2.0 lisansı.',
    jspdf: 'PDF oluşturma: jsPDF — MIT lisansı.',
    dejavu: 'PDF yazı tipi: DejaVu Sans — serbest lisans (Bitstream Vera türevi).',
    fonts: 'Arayüz yazı tipleri: IBM Plex Sans ve Source Serif 4 — SIL Open Font License.',
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
    topicSuitLongest: 'Konu rengi bu elin açacağı renk (en uzun; eşitse yüksek renk)',
    advanced: 'Gelişmiş',
    controls: 'Kontrol (A=2, K=1)',
    ltc: 'Kaybeden löve (LTC)',
    exclude: 'Hariç tut',
    excludeHelp: 'El bunlardan birine uyuyorsa kullanılmaz (örn. 1NT eli).',
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
