# Briçhane — Geliştirme fikirleri

Yapılacak ve düşünülen özelliklerin listesi. Canlı belge: yeni fikir gelince ilgili bölüme eklenir, **uygulanan madde silinir** (geçmişi git'te ve `CLAUDE.md`'de). Mevcut durum ve kurallar için [CLAUDE.md](CLAUDE.md).

Öncelik: **Sıradaki** → hemen ele alınacaklar; **Fikirler** → değerlendirilecekler; **Sonraki etap** → hoca onayından ve ticari karardan sonra.

---

## Sıradaki

### Kendin oyna
Öğrenci kartı kendisi seçer; her karttan sonra "Doğru kart ✓" ya da "Bu kart 1 löveye mal oldu" yazar, en iyi kart(lar) gösterilir.
- Altyapı hazır: Oynat ekranı (`PlayView`), DDS işçisi, `play.ts`. `bridge-dds`'in henüz kullanılmayan `AnalysePlayPBN` fonksiyonu oynanan dizinin her adımındaki löve kaybını verir.
- Öğrenci hangi koltuk(lar)ı oynar: deklare + yer (varsayılan), ya da savunma. Diğer koltuklar çift kukla oynar.
- Kontrat: par (varsayılan) ya da tablodan seçilen hücre — Oynat'taki gibi.
- Sonunda özet: yapılan löve, çift kukla sonucu, hatalı kartların listesi.

### Hoca kopyası PDF
- Board notları ve set notu PDF'te.
- Sayfa başına 4 board seçeneği (şimdi 6); notlara yer kalsın.

### PBN içe aktarma
Bridge Composer, BBO ya da turnuvadan gelen `.pbn` dosyası yüklenince eller açılır, analiz edilir, oynatılır, PDF/PBN alınır, sete kaydedilir.
- PBN okuyucu hazır (`src/engine/pbn.ts`); dosyada `DoubleDummyTricks` varsa yeniden hesaplamaya gerek yok.
- Sette `topicId` için "içe aktarılan" türü gerekir (tarif yok); Firestore kuralları buna göre güncellenmeli.

---

## Fikirler

### Baskı
- **Öğrenci kopyası koltuk koltuk:** her öğrenci yalnızca kendi elini görür (Kuzey/Doğu/Güney/Batı ayrı sayfa) — masada dağıtım için.
- **Perde kartı (curtain card):** her el için kesilip board'a konan küçük kartlar.
- LIN dışa aktarma (BBO'ya doğrudan yükleme).

### Konular
- Yeni hazır konular: Jacoby transfer (♥/♠ ayrı), 2♣ güçlü açış, splinter, Blackwood/RKCB, preemptif açılışlar (3'lü), dengeleme (balancing), negatif kontr.
- Lebensohl'un ikinci kullanımı: rakip zayıf iki açar, ortak kontr eder, cevapçı 2NT ile zayıf/güçlü eli ayırır (ayrı konu olarak).
- Konu açıklamasına kısa "derste ne sorulur" notu.
- **Konuya göre defos anlaşması:** "Defos: Lavinthal" konusu Oynat'ı Lavinthal ile, "Defos: Roman" Roman ile açsın (şimdi açıklamada "Oynat'ta seçilmeli" yazıyor; seçim tarayıcıda hatırlanan genel ayar).
- **Roman açılışta:** hocanın notu "anlaşmaya bağlı olarak açılışta da kullanılabilir" diyor; motor şu an Roman'ı yalnızca defosta kullanıyor. Hoca isterse `signals.ts`'e ve Oynat'a seçenek olarak eklenir.

#### İleri sürümler: Lebensohl ve Check Back Stayman (hoca dönüşüne göre eklenecek ya da silinecek)
Hoca ilk sürümleri ileri seviye buldu; `topics.ts`'te artık temel öğretim sürümleri var. Geniş sürümler aşağıda; eklenirse ayrı id (`lebensohl-advanced`, `check-back-stayman-advanced`) ve "(ileri)" adıyla, temel sürümlerin yanına. Temelde üretilmeyen ama burada çıkanlar:
- **Lebensohl:** davet (8–9 HP), dengeli manş eli (3NT hızlı/yavaş stoper ayrımı), rakip renginde 3–4 (cezalı kontr), 5'li renkli eller, şlem elleri.
- **Check Back:** açanın 4'lü ♥'ı (1♠ cevabından sonra), cevapçının 5-4 majörü, 6'lı majör, ikinci 5'li renk, şlem elleri.

```ts
{
  // 1NT – (2♦/2♥/2♠) – ?: 2NT 3♣ ister; zayıf el renginde durur, güçlü el kesere göre konuşur.
  // 2♣ müdahalesi yok sayılır (1NT – Pas gibi), bu yüzden konu rengi ♦ ♥ ♠.
  id: 'lebensohl-advanced',
  name: 'Lebensohl (ileri)',
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
  id: 'check-back-stayman-advanced',
  name: 'Check Back Stayman (ileri)',
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
```
Testleri `b79d73e` commit'indeki `topics.test.ts`'te (eski id'lerle).

### Analiz ve oyun
- Kontratı tablodan seçip "Kendin oyna" ile çift kuklayla karşılaştırma.
- İlk çıkış analizi: savunmacının her olası çıkışının kaç löve verdiği (DDS `SolveBoard` ile, tek hesap).
- Board'da "en iyi kontrat" yerine zona göre puan tablosu (her kontrat için skor).

### Paylaşım
- Hoca seti bir bağlantıyla öğrencilere açar; öğrenciler Oynat / Kendin oyna ile çalışır (salt okunur görünüm).
- Bağlantı için QR kod (derste tahtaya yansıtmak için) — küçük bir kütüphane gerekir.

### Altyapı
- **App Check** (reCAPTCHA v3): Firebase konsolunda anahtar oluşturulunca `VITE_RECAPTCHA_SITE_KEY` ile açılır; kod hazır.
- **Günlük yedek:** Firestore yedekleri Blaze (faturalı) plan istiyor; karar bekleniyor.
- **Firebase Analytics:** hangi konuların ne sıklıkla üretildiği (ücretsiz).
- Performans: telefonda 32 board üretimi + çift kukla süresi ölçülsün.

### Kullanıcı tarafında doğrulama (hoca/kullanıcı)
- Birkaç board'un çift kukla sonucunu Bridge Composer / BSOL ile karşılaştırma.
- İndirilen PBN'i Bridge Composer / BBO / dağıtma makinesinde açma.

---

## Hoca ile deneme

- 2–3 hafta gerçek derslerde kullanım.
- Geri bildirim listesi: eksik konular, yanlış aralıklar (hocanın sistemine göre), arayüz zorlukları.
- **Apel kuralları:** hocaya giden belgedeki 12 soru (https://claude.ai/artifact/JiRGdja5MiFPUsvvR6ZcCZ) yanıtlanınca `engine/signals.ts` ve gerekirse varsayılan anlaşma (Standart + Roman) güncellenir.
- Hoca "tamam, böyle satılır" deyince **Sonraki etap**'a geçilir.

---

## Sonraki etap (şimdilik yapılmayacak)

### Auth ve üyelik
- Firebase Auth (e-posta + Google).
- `users/{uid}`: ad, rol (`teacher` / `student`), `subscriptionEndsAt`.
- Güvenlik kuralları kullanıcı bazlı; App Check kalır.
- **Kullanıcı başına en fazla 10 set (kayan pencere):**
  - Her set sahibine bağlı (`ownerId`); kullanıcı yalnızca kendi setlerini görür ve düzenler.
  - 10 set doluyken yeni set kaydedilince **en eski set (ve board notları) otomatik silinir**; her zaman son 10 set kalır.
  - Silme yeni kayıtla birlikte toplu işlemle (transaction/batch); kurallar yalnızca sahibin kendi setini silmesine izin verir. Daha sağlam: Blaze'de bir Cloud Function her yeni setten sonra fazlasını temizler.
  - Kaydet ekranında 10. setten sonra uyarı: "Yeni set kaydedilince en eski set (ad) silinecek".
  - Gelince "gerçek silme kapalı / `deleted: true`" kuralı kullanıcı setleri için kalkar.
  - Auth öncesi kaydedilmiş (sahipsiz) setler geçişte hocanın hesabına aktarılır.

### Abonelik (iyzico)
- iyzico abonelik ürünü + aylık / yıllık plan.
- Firebase Blaze + Cloud Functions: ödeme başlatma ve webhook.
- Abonelik durumunu **yalnızca Function** yazar, istemci asla.
- Gerekenler: ticari kayıt, mesafeli satış sözleşmesi, KVKK aydınlatma metni, e-arşiv fatura.

### Eğitim notları
- Konu başına ders notu sayfası (zengin metin + el diyagramı gömme).
- Konu → not → örnek eller zinciri.

### İçerik koruma
- Konu tarifleri ve notlar yalnızca abonelere Firestore'dan okunur.
- Eşzamanlı oturum sınırı (hesap paylaşımını azaltmak için).
