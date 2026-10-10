Briçhane bir briç evidir: hoca derse hazırlanırken masasına oturur, elleri üretir, inceler, yazdırır. Arayüz bir briç yayınının sayfası gibi davranır — kâğıt zemin, koyu mürekkep, çuha yeşili tek vurgu. Süs yok; yoğun bilgi düzenle okunur kılınır.

## İçerik ilkeleri

- **Dil tamamen Türkçe.** Briç terimlerinde uluslararası kısaltmalar: NT, HP, A K Q J, PBN. Koltuklar **K D G B**, ortaklıklar **KG** ve **DB**.
- **Kullanıcıya "siz" diye seslenin**, kısa ve emir kipinde: "Bir konu seçip “Üret”e basın.", "Aralıkları genişletin." Ünlem, emoji, şaka yok.
- **Düğmeler fiildir:** Üret, Durdur, Kaydet, Uygula, Vazgeç, PDF indir, Bağlantıyı paylaş, Arşivle, Sil.
- **Süren işler üç nokta (…) ile:** "Üretiliyor…", "Hazırlanıyor…", "Çift kukla hesaplanıyor…". Tek karakter `…` kullanın.
- **Ara nokta (·) ile birleştirin:** "Board 3 · Dağıtıcı G · DB zon", "Takeout kontr · 16 board".
- **Türkçe sayı biçimi:** binlikte nokta (12.000), ondalıkta virgül (%0,54), tarih "10 Eki 2026 22:08" ya da "10.10.2026". Aralıklarda en tire: 15–17 HP.
- **Tırnak** Türkçe çift tırnak “ ”. Büyük harf yalnızca cümle başında ve özel adlarda ("Setlerim'de aç").
- **Hata ve uyarılar ne yapılacağını söyler:** "1 ile 128 arasında bir sayı girin.", "Bu koşulda el bulunamadı, aralıkları genişletin."
- Türkçe karakterler (ç ğ ı İ ö ş ü) her yerde doğru görünmeli; yüklenen yazı tipleri latin-ext dahil tam setlerdir.

## Renk

- Sayfa zemini `paper`; kartlar, pencereler ve form alanları `surface`; tablo başlıkları ve bilgi kutuları `surface-sunken`.
- Metin `ink`; ikincil bilgi (HP, tarih, ipucu) `ink-muted`.
- **`felt` tek marka rengidir** — ekranda az kullanın: birincil düğme, etkin gezinme çizgisi, ilerleme çubuğu, logo, odak halkası, başarı. Dolgu üstünde metin `on-felt`.
- **Briç renkleri yalnızca kendi anlamlarında:** ♥ ♦ `suit-red`, ♠ ♣ `suit-black`; zon şeridi `vuln` (+ `on-vuln`); par hücresi `par` (sarı). Bunları süs ya da durum rengi olarak kullanmayın. Hata için `danger-*`, uyarı için `warning-*` vardır.
- Kart değerleri (A K 10 5) her zaman `ink`; yalnızca sembol renklidir.
- Ayırıcılar `line`; kontrol kenarları ve board kutusu çerçevesi `line-strong` (3:1).
- İki tema: **Kâğıt (açık)** varsayılan ve PDF'in karşılığı; **Gece (koyu)** telefonda karanlık salonlar için. Koyu temada açık vurgular (`felt`, `vuln`) üstünde metin koyudur — bu yüzden `on-felt`, `on-vuln` kullanın, sabit beyaz değil.
- Tüm metin çiftleri her iki temada 4.5:1'i, kenarlık ve ikonlar 3:1'i geçer.

## Tipografi

- İki aile: **Source Serif 4** (`serif`) başlıklar ve board numarası için; **IBM Plex Sans** (`sans`) geri kalan her şey için. Dosyalar `fonts/` altında (SIL OFL).
- Sayfa başlığı `display`, pencere başlığı `title`, bölüm başlığı `heading`; gövde `body`, alt satır `body-sm`, form etiketi `label`, board başlığı ve etiketler `caption`.
- Eller `cards` (büyük görünümde `cards-lg`), tablolar `table-num`. Rakamlar tabular (`font-variant-numeric: tabular-nums`) — sütunlar hizalı kalır.
- Renk sembollerini yazı tipinden değil `Suit` bileşeninden çizin.

## Boşluk, köşe, gölge

- 4px tabanlı ölçek: `space-1` … `space-7`. Telefonda sayfa kenarı `space-4`, genişte `space-5`; board ızgarası aralığı `space-4`.
- Köşeler: `radius-sm` etiket/kutu, `radius-md` düğme/alan/bildirim, `radius-lg` kart/pencere.
- **Kenarlık, gölge değil.** Tek gölge `shadow-dialog`, yalnızca pencerelerde.
- Dokunma hedefi en az 32px; kontroller `control-height` (40px).
- Odak: 2px düz `focus` çizgisi, 2px boşlukla — her zeminde görünür.

## Düzen

- **Önce telefon** (≈390px): her ekran yatay kaydırmasız çalışır. İçerik en fazla `content-max` (1200px) genişliğinde, ortalanır.
- Üst bar `TopBar` (56px). Alt bilgide yalnızca **Hakkında** bağlantısı.
- Board ızgarası `repeat(auto-fill, minmax(var(--board-min), 1fr))`: telefonda tek sütun, genişte 2–4.
- Board diyagramı her zaman pusula düzenindedir: Kuzey üst, Batı sol, Doğu sağ, Güney alt; ortada `BoardBox`.
- Pencereler (`Dialog`) telefonda neredeyse tam genişliktir ve uzun formlar kayar.
- Hareket azdır: yalnızca ilerleme çubuğu ve hover renk geçişleri. Sayfa animasyonu yok.

## Briç bileşenleri

`Suit` → `Hand` → `BoardBox` → `DDTable` → `BoardCard` bir set halinde kurulur. Board başlığı "Board 3 · Dağıtıcı G · DB zon"; par satırı "Par: 4♠ G · KG +420". Öğrenci modunda (`studentMode`) konu dışı eller "Gizli" yazar, tablo görünmez.

## Logo ve ikonlar

- İşaret: ev silüeti içinde pik — "briç" + "hane". Kullanımlar ve mürekkepler için `assets/Logos/README.md`. Uygulama simgesi ve favicon `felt` kare üstünde açık evdir.
- PDF başlığında `brichane-lockup-ink.svg` (tek renk).
- Renk sembolleri `assets/Suits/` ve `Suit` bileşeni. Arayüz ikonları (bildirim ikonları, onay işareti) 1.6px çizgili, yuvarlak uçlu, 16px ızgarada; emoji kullanılmaz.

## Yazdırma (PDF)

A4 dikey, sayfa başına 6 board (2 × 3). Açık tema değerleriyle, beyaz kâğıtta: zemin `paper` yerine beyaz, kenarlar `line-strong`, par hücresi `par`. Başlıkta set adı (`title`) ve "Konu: … · 16 board · 10 Eki 2026" (`body-sm`, `ink-muted`).
