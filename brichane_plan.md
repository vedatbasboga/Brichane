# Briçhane — Proje Planı

> Konuya göre briç eli üreten, çift kukla analizi yapan ve setleri PBN/baskı olarak veren web uygulaması.
> İleride: eğitim notları, üyelik ve abonelik.

Bu plan Claude Code ile **faz faz** uygulanmak üzere yazıldı. Her fazı ayrı bir görev olarak verin, "Bitti sayılır" maddeleri sağlanmadan sonraki faza geçmeyin.

## İlerleme

- [x] Faz 1 — Proje iskeleti
- [x] Faz 2 — Briç motoru (çekirdek)
- [x] Faz 3 — Arayüz: üret ve incele
- [x] Faz 4 — Konu kütüphanesi (sabit liste + özel dağılım)
- [ ] Faz 5 — Firebase bağlantısı (Auth olmadan)
  - [x] Proje `brichane-0`, Firestore `europe-west3`, güvenlik kuralları (şema doğrulama, silme kapalı) — canlıda test edildi
  - [x] Kaydet + Setlerim (liste, aç, başlık/not, board notu, kopyala, arşivle)
  - [x] Yayın: https://brichane-0.web.app (`npm run deploy`, önizleme: `npm run deploy:preview`)
  - [ ] App Check (reCAPTCHA v3) — konsolda anahtar oluşturulması bekleniyor
  - [ ] Günlük yedek — Firestore yedekleri Blaze (faturalı) plan istiyor; karar bekleniyor
- [ ] Faz 6 — Çift kukla analizi (DDS)
  - [x] `bridge-dds` (DDS WebAssembly, Apache 2.0); 3 paralel işçi, 16 board ~2 sn (masaüstü)
  - [x] Löve tablosu + par: kartta küçük, büyük görünümde tam; PDF'te; "sadece konu eli"nde gizli
  - [x] Sete bir kez yazılır (kurallar: yalnızca henüz yoksa); eski setlerde açılınca hesaplanır
  - [x] Bağımsız DDS derlemesiyle 400/400 hücre doğrulandı; "Hakkında" sayfasında atıf
  - [ ] Bridge Composer / BSOL ile birkaç board karşılaştırması (hoca/kullanıcı)
- [ ] Faz 7 — Dışa aktarma ve baskı
- [ ] Faz 8 — Test ve iyileştirme (hoca ile)
- [ ] Faz 9 — Sonraki etap (şimdilik yapılmayacak)

---

## 0. Kapsam ve kararlar

### İlk etap (şimdi)
- Kullanıcılar: sadece geliştirici + hoca
- Konu seç → N adet el üret → incele → kaydet → PBN indir / yazdır
- Çift kukla (double dummy) tablosu ve par skor
- Firebase **Hosting** (yayında görmek için) + **Firestore** (konular ve setler)
- **Auth yok**

### Sonraki etap (onay verildikten sonra)
- Firebase Auth + üyelik
- iyzico ile aylık / yıllık abonelik
- Eğitim notları bölümü

### Teknoloji
| Katman | Seçim | Neden |
|---|---|---|
| Build | Vite | Hızlı, sade, Firebase Hosting'e statik çıktı verir |
| Dil | TypeScript | El/kısıt modeli tip güvenliğinden çok fayda görür |
| UI | React | İleride eğitim notları, üyelik ekranları ile büyüyecek |
| Stil | Tailwind CSS | Hızlı arayüz, ayrıca baskı stili kolay |
| Test | Vitest | Motor fonksiyonları için birim testleri |
| Ağır işler | Web Worker | El üretimi ve DDS arayüzü kilitlemesin |
| Çift kukla | DDS (WebAssembly) | Sektör standardı çözücü |
| Veri | Firestore | Setler, notlar (konular kodda sabit) |
| Yayın | Firebase Hosting | Ücretsiz, tek komutla deploy |

### Kod kuralları
- Kod (değişken, fonksiyon, dosya adları) **İngilizce**, arayüz metinleri **Türkçe**.
- Tüm arayüz metinleri tek bir dosyada (`src/i18n/tr.ts`) — ileride İngilizce eklemek kolay olsun.
- Briç motoru (`src/engine/`) React'ten tamamen bağımsız, saf TypeScript olsun ve testlerle korunsun.

---

## 1. Proje iskeleti

**Yapılacaklar**
1. Vite + React + TypeScript projesi oluştur (`briçhane` değil `brichane` klasör adı).
2. Tailwind, ESLint, Prettier, Vitest kur.
3. Klasör yapısı:
   ```
   src/
     engine/        # saf briç mantığı (kart, el, kısıt, üretici, PBN)
     workers/       # dealWorker.ts, ddsWorker.ts
     data/          # varsayılan konu tarifleri
     firebase/      # firebase init + firestore erişim katmanı
     components/    # HandDiagram, DealCard, DDTable, TopicForm...
     pages/         # Generate, Sets, Topics, Print
     i18n/tr.ts
   ```
4. Git deposu + `CLAUDE.md` (bu plandaki kod kurallarını ve klasör yapısını içersin).

**Bitti sayılır:** `npm run dev` boş bir "Briçhane" sayfası açıyor, `npm test` çalışıyor.

---

## 2. Briç motoru (çekirdek)

`src/engine/` altında, tamamen test edilmiş.

### 2.1 Temel tipler
- Kart: 0–51 arası sayı (renk × 13 + değer). Renk sırası: ♠ ♥ ♦ ♣.
- `Seat`: N, E, S, W. `Deal`: 4 el. `Hand`: 13 kart.
- Yardımcılar: kart → "♠A" metni, el → renklere göre sıralı gösterim.

### 2.2 Dağıtım
- Fisher–Yates karıştırma, `crypto.getRandomValues` ile (taraflılık olmadan).
- **Tohumlu (seed) rastgele sayı üreteci** seçeneği: aynı tohum = aynı set. Hoca bir seti tekrar üretebilsin ya da öğrencilerle paylaşabilsin.
  - *Güncelleme:* Kullanıcı kodu görmez/yazmaz; her üretim rastgele koddur. Paylaşım **bağlantı** ile: `/?v=1&konu=…&el=16&kod=…&iz=…` (özel dağılımda `tarif=` ile ayarlar da bağlantıda). Bağlantı açılınca aynı eller üretilir; konu tarifi sonradan değiştiyse (`iz`) ya da sürüm eskiyse uyarı gösterilir. "Bağlantılar bozulmasın" testi (`src/data/golden.test.ts`) sabit kodların ellerini korur.

### 2.3 El değerlendirme
- HP (A=4, K=3, Q=2, J=1)
- Renk uzunlukları, dağılım deseni (ör. 5-3-3-2)
- Dengeli (4333, 4432, 5332), yarı dengeli (5422, 6322 vb.)
- Kontroller (A=2, K=1), kaybeden löve sayısı (LTC)
- Ortaklık toplamları (NS toplam HP, ortak fit uzunluğu)

### 2.4 Kısıt (tarif) modeli
Her konu bir JSON tarif. Örnek:
```json
{
  "id": "1nt-opening",
  "name": "1 Sanzatu Açılışı",
  "category": "Açılışlar",
  "dealer": "S",
  "seats": {
    "S": { "hcp": [15, 17], "shape": "balanced", "suits": { "S": [0, 4], "H": [0, 4] } }
  },
  "pair": {},
  "placement": "balanced"
}
```
- El başına: `hcp`, `shape` (balanced / semi-balanced / any), renk başına uzunluk aralığı, `controls`, `ltc`, `anySuit` (şu renklerden en az biri), `exclude` (şu ellerden biri olmasın)
- Ortaklık başına: toplam HP aralığı, belirli renkte ortak fit
- ~~`rotate`: üretilen elleri rastgele 180° çevir~~ → yerine `placement` (hoca geri bildirimi: el hep aynı tarafta olmasın):
  - `balanced` (varsayılan): tarifteki dağıtıcı, board'un standart dağıtıcısına çevrilir → konu eli K/D/G/B'ye eşit dağılır (16 board'da her koltuğa 4), dağıtıcı ve zon standart board'larla uyumlu
  - `fixed`: eller tarifte yazılan koltukta kalır

### 2.5 Üretici
- Reddetme örneklemesi: dağıt → kontrol et → uymazsa at.
- `maxAttempts` sınırı; tarif çok nadirse "Bu koşulda el bulunamadı, aralıkları genişletin" uyarısı ve gözlenen olasılık.
- Web Worker'da çalışır, ilerleme yüzdesi bildirir.

### 2.6 Board bilgileri
- Board numarasına göre standart dağıtıcı ve zon döngüsü (16'lık döngü).
- Tarif dağıtıcı belirtiyorsa ona uy.

**Bitti sayılır:**
- 1NT tarifiyle 100 el 1 saniyenin altında üretiliyor.
- Her üretilen el tarife uyuyor (testle doğrulanmış).
- Aynı tohum aynı seti veriyor.
- HP, dağılım ve dengeli tespiti için birim testleri geçiyor.

---

## 3. Arayüz: üret ve incele

### Sayfa: **El Atölyesi** (ana sayfa)
1. Konu seçici (kategoriye göre gruplanmış)
2. El sayısı (varsayılan 16), tohum alanı (boş = rastgele)
3. "Üret" butonu + ilerleme çubuğu
4. Sonuç ızgarası: her board için klasik pusula düzeni (N üstte, S altta, E/W yanlarda), board no, dağıtıcı, zon, her elin HP'si
5. Board'a tıklayınca büyük görünüm
6. "Sadece konu elini göster / tüm elleri göster" anahtarı (derste soru sormak için)

**Bitti sayılır:** Hoca telefondan ve bilgisayardan konu seçip 16 el üretip rahatça inceleyebiliyor.

---

## 4. Konu kütüphanesi

### Varsayılan konular (`src/data/topics.ts`)
Aralıklar **hocanın sistemine göre** düzeltilecek; aşağıdakiler başlangıç değerleri:

| Kategori | Konu | Ana koşul |
|---|---|---|
| Açılışlar | 1 Sanzatu açılışı | S: 15–17 HP, dengeli |
| Açılışlar | 2 Sanzatu açılışı | S: 20–21 HP, dengeli |
| Açılışlar | 1 Majör açılış | S: 12–21 HP, 5+ ♥ veya ♠ |
| Açılışlar | Zayıf iki açılış | S: 6–10 HP, 6'lı renk |
| 1NT sonrası | Stayman | S: 1NT eli; N: 8+ HP, 4'lü majör |
| 1NT sonrası | Transfer | S: 1NT eli; N: 5+ majör |
| Rekabet | Takeout kontr | E: açılış; S: 12+ HP, açılan renkte kısa |
| Rekabet | Renk müdahalesi | E: açılış; S: 8–16 HP, 5+ renk |
| Şlem | Blackwood / şlem | NS toplam 33+ HP, fit |
| Oyun | Sanzatu oyun planı | NS 25–27 HP, iki el dengeli |

### ~~Sayfa: **Konular**~~ → **Özel dağılım** (geri bildirimle değişti)
Karar: kullanıcılar konu yönetmez; konu listesi kodda sabit (`src/data/topics.ts`), yeni konuları geliştirici ekler. Böylece yönetimi kolay kalır.
- El Atölyesi'ndeki konu seçicinin en altında **"Özel dağılım…"** seçeneği
- Seçilince form tabanlı tarif penceresi açılır (JSON yok): dağıtıcı, konu elinin yeri (dengeli/sabit), konu rengi; her koltuk için HP, dağılım, renk uzunlukları, "şu renklerden en az biri", kontrol, LTC, hariç tut; ortaklık HP ve fit
- Seçili hazır konunun ayarlarıyla başlar; "Uygula" ile o oturumda o koşullarla üretilir, **kaydedilmez**
- Firestore'da `topics` koleksiyonu yok

**Bitti sayılır:** Kullanıcı kod bilmeden anlık özel bir dağılımla el üretebiliyor; hazır konu listesi sabit.

---

## 5. Firebase bağlantısı (Auth olmadan)

### 5.1 Kurulum
1. Firebase projesi oluştur (`brichane`).
2. Web uygulaması ekle, yapılandırmayı `.env` dosyasına koy (`VITE_FIREBASE_*`), `.env` git'e girmesin.
3. `firebase init` → Hosting (`dist` klasörü, SPA rewrite açık) + Firestore.
4. Firestore bölgesi: `europe-west` (Türkiye'ye yakın).

### 5.2 Veri modeli
```
sets/{setId}
  title, topicId ('custom' = özel dağılım), recipe (map, tarifin o anki kopyası), seed, count, createdAt
  deals: [ { board, dealer, vul, pbn, dd?: {...}, par?: string } ]
  notes: string          # hocanın genel notu

sets/{setId}/boardNotes/{board}
  text                   # board'a özel açıklama (oyun planı, ideal açış)
```

### 5.3 Güvenlik — ÖNEMLİ
Auth olmadan Firestore herkese açık kalır; site adresini bilen herkes veriyi silebilir. Bu etap için önlemler:
1. **App Check** (reCAPTCHA v3) etkinleştir → sadece kendi sitenizden gelen istekler kabul edilir, script ile toplu silme engellenir.
2. Güvenlik kurallarında **şema doğrulaması**: sadece `sets` koleksiyonuna (ve alt koleksiyonu `boardNotes`'a), beklenen alanlarla yazmaya izin ver; diğer her şey kapalı.
3. **Silme kapalı** olsun; arayüzde "sil" yerine `archived: true` işaretlensin.
4. Firestore'un **günlük otomatik yedeği** (point-in-time recovery veya planlı export) açılsın.
5. Site adresi paylaşılmasın.

> Alternatif (tek satırlık ek iş): Google ile giriş + kurallarda sadece iki e-posta adresine izin. Üyelik sistemi değildir, sadece kapı kilididir. Veri değerli hale gelince bu yapılmalı.

### 5.4 Arayüz
- Üretilen seti "Kaydet" ile Firestore'a yaz
- Sayfa: **Setlerim** — liste, aç, başlık/not düzenle, arşivle, kopyala

### 5.5 Yayın
- `npm run build && firebase deploy`
- Denemeler için **preview channel** (`firebase hosting:channel:deploy test`) — canlıyı bozmadan hocaya link gönderilir.

**Bitti sayılır:** Site `brichane.web.app` adresinde açılıyor, hoca bir set kaydedip başka cihazdan açabiliyor.

---

## 6. Çift kukla analizi (DDS)

1. DDS'in WebAssembly sürümünü entegre et.
   - Önce hazır npm paketini değerlendir (`@bridge-tools/dd`); güncel ve çalışıyorsa onu kullan.
   - Değilse resmi DDS kaynağını (`dds-bridge/dds`) Emscripten ile derle.
2. Ayrı bir Web Worker'da çalıştır (`ddsWorker.ts`).
3. Her board için 4 deklare × 5 koz (♣ ♦ ♥ ♠ NT) löve tablosu + par skor/kontrat.
4. Sonuçları sete kaydet (bir kez hesapla, Firestore'dan oku).
5. Arayüz: board kartının altında küçük tablo, büyük görünümde tam tablo.
6. Lisans: DDS Apache 2.0 — "Hakkında" sayfasına atıf ekle.

**Bitti sayılır:** 16 board'luk setin tablosu birkaç saniyede çıkıyor, değerler Bridge Composer / BSOL ile birkaç örnekte karşılaştırılıp doğrulanmış.

---

## 7. Dışa aktarma ve baskı

### 7.1 PBN
- PBN 2.1 standart etiketleri: `Event`, `Board`, `Dealer`, `Vulnerable`, `Deal`
- Çift kukla sonuçları için Bridge Composer'ın okuduğu etiketler (`DoubleDummyTricks`, `OptimumScore`, `ParContract`) — Bridge Composer ile açılarak doğrulansın
- Board notları `{ }` yorum bloğu olarak
- Test: dosya Bridge Composer'da ve BBO'da sorunsuz açılıyor

### 7.2 Baskı
- Sayfa: **Yazdır** — A4'e 4 veya 6 board, isteğe bağlı DD tablosu ve notlar
- İki mod: "Öğrenci kopyası" (sadece konu eli) ve "Hoca kopyası" (tüm eller + analiz + notlar)
- Tarayıcının "PDF olarak kaydet" özelliğiyle PDF

### 7.3 (Opsiyonel) LIN
- BBO'ya doğrudan yüklemek için LIN formatı

**Bitti sayılır:** Hoca derse girmeden setini yazdırabiliyor veya Bridge Composer'a aktarabiliyor.

---

## 8. Test ve iyileştirme (hoca ile)

- 2–3 hafta gerçek derslerde kullanım
- Geri bildirim listesi: eksik konular, yanlış aralıklar, arayüz zorlukları
- Performans: telefonda 32 board üretimi + DDS süresi ölçülsün
- Konu kütüphanesi hocanın müfredatına göre genişletilsin

**Bitti sayılır:** Hoca "tamam, böyle satılır" diyor → Faz 9'a geç.

---

## 9. Sonraki etap (şimdilik yapılmayacak)

### 9.1 Auth ve üyelik
- Firebase Auth (e-posta + Google)
- `users/{uid}`: ad, rol (`teacher` / `student`), `subscriptionEndsAt`
- Güvenlik kuralları kullanıcı bazlı; App Check kalır
- **Kullanıcı başına kayıtlar, en fazla 10 set (kayan pencere):**
  - Her set sahibine bağlı (`ownerId`); kullanıcı yalnızca kendi setlerini görür ve düzenler
  - 10 set doluyken yeni set kaydedilince **en eski set (ve board notları) otomatik silinir**; her zaman son 10 set kalır
  - Silme, toplu bir işlemle (transaction/batch) yeni kayıtla birlikte yapılır; kurallar yalnızca sahibin kendi setini silmesine izin verir. Daha sağlam seçenek: Blaze'e geçilince bir Cloud Function her yeni setten sonra fazlasını temizler
  - Kaydet ekranında 10. setten sonra uyarı: "Yeni set kaydedilince en eski set (ad) silinecek"
  - Bu gelince "silme kapalı / arşivle" kuralı kullanıcı setleri için kalkar; arşivleme gerekip gerekmediği yeniden değerlendirilir
  - Auth öncesi kaydedilmiş (sahipsiz) setler: geçişte hocanın hesabına aktarılır

### 9.2 Abonelik (iyzico)
- iyzico abonelik ürünü + aylık / yıllık plan
- Firebase Blaze plan + Cloud Functions: ödeme başlatma ve webhook karşılama
- Abonelik durumunu **sadece Function** yazar, istemci asla
- Gerekenler: ticari kayıt, mesafeli satış sözleşmesi, KVKK aydınlatma metni, e-arşiv fatura

### 9.3 Eğitim notları
- Konu başına ders notu sayfası (zengin metin + el diyagramı gömme)
- Konu → not → örnek eller zinciri

### 9.4 İçerik koruma
- Konu tarifleri ve notlar sadece abonelere Firestore'dan okunur
- Eşzamanlı oturum sınırı (hesap paylaşımını azaltmak için)

---

## Claude Code ile çalışma önerisi

1. İlk görev: "PLAN.md'yi oku, Faz 1'i uygula, CLAUDE.md'yi oluştur."
2. Her fazdan sonra: testleri çalıştır, yerelde dene, git commit.
3. Faz 2'yi (motor) testlerle sağlamlaştırmadan arayüze geçme — her şey onun üstüne kuruluyor.
4. Firebase komutlarını (`firebase login`, `firebase init`) kendi bilgisayarında elle çalıştırman gerekebilir; Claude Code dosyaları hazırlar.
