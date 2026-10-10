# Briçhane — Ürün ve ekran tanımı

> Bu belge Briçhane'nin **ne olduğunu, ne işe yaradığını ve her ekranda neler bulunduğunu** anlatır. Görsel tasarım ve logo için bir başlangıç bilgisidir; görünümle ilgili bir yönlendirme içermez.

Canlı sürüm: https://brichane-0.web.app

---

## 1. Ürün özeti

**Briçhane**, briç dersleri için konuya göre el üreten bir web uygulamasıdır. Adı "briç" ve "hane" (ev) kelimelerinden oluşur.

Bir briç hocası derste belirli bir konuyu (örneğin "1NT açılışı" ya da "Takeout kontr") işlemek ister. Bunun için o konuya uyan çok sayıda ele ihtiyaç duyar. Briçhane:

1. Seçilen konuya uyan elleri saniyeler içinde **üretir**. Varsayılan 16 board, en fazla 128.
2. Her board için **çift kukla analizi** yapar: hangi oyuncunun hangi kozda hangi kontratı yapabileceğini ve "par" sonucunu gösterir.
3. Seti **PDF** (yazdırmak için), **PBN** (diğer briç programları ve kart dağıtma makineleri için) ya da **paylaşım bağlantısı** olarak verir.
4. Beğenilen setleri **kaydeder**; hoca sonra açıp başlık, not ve board notları ekleyebilir.

**Kullanıcılar**

- **Şimdi:** Geliştirici ve bir briç hocası (deneme aşaması). Üyelik yok.
- **Sonra:** Briç hocaları ve öğrenciler; üyelik, aylık/yıllık abonelik ve ders notları gelecek (bkz. bölüm 8).

**Nerede kullanılır:** Hem **telefonda** (hoca derste, masada) hem **bilgisayarda** (ders hazırlığı). Ayrıca **yazdırılır** (PDF).

**Dil:** Arayüz tamamen Türkçe. Briç terimlerinde uluslararası kısaltmalar kullanılır (NT, HP, A K Q J).

---

## 2. Briç kavramları (sözlük)

| Terim                  | Anlamı                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **El**                 | Bir oyuncunun 13 kartı.                                                                                                                |
| **Board / dağıtım**    | Dört elin birlikte oluşturduğu bir dağıtım. Numaralıdır (Board 1, 2, 3…).                                                              |
| **Koltuklar**          | Kuzey, Doğu, Güney, Batı. Arayüzde kısaltmaları **K, D, G, B**. Ortaklıklar: **KG** (Kuzey–Güney) ve **DB** (Doğu–Batı).               |
| **Renkler**            | ♠ Pik, ♥ Kupa, ♦ Karo, ♣ Sinek. Kozsuz oyun **NT** (Sanzatu).                                                                          |
| **Kart değerleri**     | A K Q J 10 9 … 2.                                                                                                                      |
| **Dağıtıcı**           | O board'da ilk konuşan oyuncu. Board numarasına göre K → D → G → B diye döner.                                                         |
| **Zon**                | Bir tarafın "riskli" durumda olup olmadığı. Değerler: Zon yok, KG zon, DB zon, Herkes zon. 16 board'luk standart bir döngüyle değişir. |
| **HP**                 | Honör puanı (A=4, K=3, Q=2, J=1). Bir elin gücünün temel ölçüsü.                                                                       |
| **Dağılım**            | Bir eldeki renk uzunlukları, örn. 5-3-3-2. "Dengeli", "yarı dengeli", "dengesiz" diye sınıflanır.                                      |
| **LTC / Kontrol**      | El değerlendirme ölçüleri (kaybeden löve sayısı; A=2, K=1 kontrol).                                                                    |
| **Konu**               | Bir dersin teması ve ona uyan el koşulları ("tarif"). Örn. 1NT açılışı: açan 15–17 HP, dengeli.                                        |
| **Konu eli**           | Konunun ilgilendiği el(ler), örn. 1NT'yi açan el.                                                                                      |
| **Özel dağılım**       | Kullanıcının o an kendi belirlediği koşullar (kaydedilmez).                                                                            |
| **Set**                | Bir seferde üretilen board'ların tamamı (örn. 16 board).                                                                               |
| **Çift kukla analizi** | Dört el de açıkken, herkes hatasız oynarsa her oyuncunun her kozda yapabileceği en yüksek kontrat.                                     |
| **Par**                | İki taraf da kusursuz oynarsa board'un beklenen sonucu, örn. "4♠ KG · KG +420".                                                        |
| **PBN**                | Briç programlarının ortak dosya biçimi (Bridge Composer, BBO, kart dağıtma makineleri).                                                |

**Alan gelenekleri (bilgi amaçlı):** Briç yayınlarında ♥ ve ♦ genellikle kırmızı, ♠ ve ♣ siyah gösterilir. Board diyagramlarında Kuzey üstte, Güney altta, Batı solda, Doğu sağda yer alır ("pusula düzeni"). Zonlu taraf geleneksel olarak işaretlenir (çoğunlukla kırmızıyla).

---

## 3. Site haritası ve akış

```
Üst bar: [Briçhane logosu/adı]   [El Atölyesi]  [Setlerim]

/                  El Atölyesi (ana sayfa)
  ├─ Özel dağılım penceresi (konu seçicide "Özel dağılım…")
  ├─ Board büyük görünüm penceresi
  └─ Seti kaydet penceresi
/sets              Setlerim (kayıtlı setler listesi)
/sets/:id          Set sayfası (kayıtlı bir set)
  └─ Board büyük görünüm penceresi (+ board notu)
/about             Hakkında

Alt bilgi: [Hakkında]
```

**Ana akış**

1. Kullanıcı **El Atölyesi**'nde bir konu ve el sayısı seçer, **Üret**'e basar.
2. Board'lar ızgara halinde görünür. Çift kukla analizi arka planda birkaç saniyede tamamlanır ve her board'un altına eklenir.
3. Kullanıcı bir board'a tıklayıp büyük görünümde inceler; önceki/sonraki ile board'lar arasında gezinir.
4. Seti şunlardan biriyle kullanır:
   - **Bağlantıyı paylaş:** Bağlantıyı açan kişi aynı elleri görür.
   - **PDF indir:** Yazdırmak için A4.
   - **PBN indir:** Diğer briç programları için.
   - **Kaydet:** Setlerim'e eklenir.
5. Kaydedilen seti **Setlerim**'den açıp başlık, genel not ve board notları ekler; oradan da paylaşır ya da indirir.

**Paylaşım akışı:** Bağlantıyı alan kişi El Atölyesi'ne gelir. Form o setin konusu ve el sayısıyla dolu gelir ve aynı eller kendiliğinden üretilir. Kayıtlı bir setin bağlantısı ise doğrudan set sayfasını açar.

**Öğrenci modu:** Ekranda ve PDF'te **"Sadece konu eli"** seçeneği vardır. Açıkken yalnızca konu eli görünür; diğer eller ve çift kukla analizi gizlenir. Hoca öğrenciye "bu elle ne açarsın?" diye sorarken kullanır.

---

## 4. Ortak öğeler

### Üst bar (her sayfada)

- Uygulama adı / logo: **Briçhane**
- Gezinme: **El Atölyesi** · **Setlerim** (aktif sayfa belli olur)

### Alt bilgi

- **Hakkında** bağlantısı

### Board kartı (El Atölyesi'nde ve set sayfasında ızgara halinde)

Her board için bir kart:

- **Başlık satırı:** "Board 3 · Dağıtıcı G · DB zon" ve sağda **Büyüt**. Kayıtlı sette notu olan board'larda ayrıca **"Not var"** işareti.
- **Pusula düzeninde dört el:** Kuzey üstte, Batı solda, Doğu sağda, Güney altta. Her elin üstünde koltuk harfi ve HP'si ("K 16 HP"). Altında dört satır, her satırda renk sembolü ve kartlar (örn. "♠ A K 10 5"; renk yoksa "—"). "Sadece konu eli" açıkken diğer eller yerine "Gizli" yazar.
- **Ortada board kutusu:** Board numarası büyük yazılır. Dört kenarında K/D/G/B harfleri; zonlu tarafın kenarları işaretli, dağıtıcının harfinin altı çizili.
- **Altta çift kukla tablosu:**
  - Sütunlar ♣ ♦ ♥ ♠ NT, satırlar K G D B.
  - Hücrede o oyuncunun o kozda yapabileceği en yüksek kontrat seviyesi (1–7) ya da "–" (kontrat çıkmaz).
  - **Par kontratın hücresi vurgulanır.**
  - Altında par satırı: "Par: 3♠ KG · KG +140".
  - Analiz sürerken tablo yerine "Çift kukla hesaplanıyor…" yazar.
  - "Sadece konu eli" açıkken tablo gizlenir.
- Kartın tamamı tıklanabilir ve büyük görünümü açar.

### Board büyük görünüm (pencere)

- **Başlık:** "Board 1 · Dağıtıcı K · Zon yok" ve **Kapat**.
- Aynı pusula düzeni, daha büyük.
- **El istatistikleri tablosu:** El (Kuzey/Doğu/Güney/Batı) · HP · Dağılım (5-3-3-2) · LTC · Kontrol. "Sadece konu eli" açıkken yalnızca konu eli listelenir.
- **"Çift kukla analizi" bölümü:** kısa açıklama ("Dört el açık ve hatasız oyunla… Sarı: par kontrat.") ve büyük tablo + par satırı.
- **Board notu** (yalnızca kayıtlı set sayfasında): çok satırlı metin alanı ve **Notu kaydet**.
- Altta **← Önceki** ve **Sonraki →**. Klavyede ← → tuşları ve Esc çalışır.

---

## 5. Ekranlar

### 5.1 El Atölyesi (ana sayfa, `/`)

**Amaç:** Konu seçip set üretmek, incelemek ve kullanmak.

**Üretim formu**

- **Konu:** Kategorilere göre gruplanmış açılır liste. Listenin en altında **"Özel dağılım…"** seçeneği var. Altında seçili konunun kısa açıklaması yazar (örn. "Açan: 15–17 HP, dengeli, 5'li majör yok."). Özel dağılım seçiliyse açıklama yerine "Kendi belirlediğiniz koşullar." ve **Ayarları düzenle** bağlantısı görünür.
- **El sayısı:** Sayı kutusu (1–128, varsayılan 16). Geçersiz değerde uyarı çıkar.
- **Üret** butonu. Üretim sürerken yerine **Durdur** gelir.

**Mevcut konular (kategoriye göre)**

- **Açılışlar:** 1 Sanzatu açılışı, 2 Sanzatu açılışı, 1 Majör açılış, 1 Minör açılış, Zayıf iki açılış
- **1NT sonrası:** Stayman, Transfer
- **Rekabet:** Takeout kontr, Renk müdahalesi
- **Şlem:** Blackwood / şlem
- **Oyun:** Sanzatu oyun planı

Konu listesini yalnızca geliştirici değiştirir; kullanıcılar konu ekleyemez.

**Durumlar**

- **Boş (ilk açılış):** "Bir konu seçip “Üret”e basın."
- **Üretiliyor:** İlerleme çubuğu ve "Üretiliyor… 7 / 16 el · 12.000 deneme". Genellikle bir saniyenin altında biter; nadir koşullarda uzayabilir.
- **Koşul çok nadirse:** Uyarı kutusu: "Bu koşulda el bulunamadı, aralıkları genişletin." Ayrıca bulunan el sayısı ve gözlenen olasılık ("Gözlenen olasılık: %0,54 (738 denemede)").
- **Bağlantı uyarısı** (paylaşım bağlantısıyla gelindiyse): Bağlantı geçersizse ya da konu sonradan değiştiyse bilgi kutusu.
- **Hata:** "Üretim sırasında hata oluştu: …"

**Sonuç alanı**

- **Üst satır:**
  - Solda: "Takeout kontr · 16 board". Analiz sürerken yanında "Çift kukla: 7/16".
  - Sağda:
    - **Sadece konu eli** (onay kutusu)
    - **Bağlantıyı paylaş:** Telefonda paylaşım menüsünü açar, bilgisayarda kopyalar ve "Bağlantı kopyalandı" yazar.
    - **PDF indir:** Hazırlanırken "Hazırlanıyor…".
    - **PBN indir**
    - **Kaydet:** Kaydedilince yerine "Set kaydedildi. **Setlerim'de aç**" gelir.
- **Board ızgarası:** Board kartları. Telefonda tek sütun, geniş ekranda 2–4 sütun.

**Not:** Üretimden sonra adres çubuğu setin paylaşım bağlantısına dönüşür. Sayfa yenilenirse aynı set gelir.

### 5.2 Özel dağılım (pencere)

El Atölyesi'nde "Özel dağılım…" seçilince açılır. Kullanıcı kendi koşullarını o anlık belirler; **kaydedilmez**. Pencere, seçili hazır konunun ayarlarıyla dolu açılır.

- **Başlık:** "Özel dağılım" ve açıklama: "Bu dağılım kaydedilmez; yalnızca şu anki üretim için kullanılır. Seçili konunun ayarlarıyla başlar." Sağda **Tüm koşulları temizle**.
- **Genel ayarlar:**
  - **Tarifin dağıtıcısı:** K/D/G/B seçimi ("Elleri bu koltuk dağıtıcıymış gibi tanımlayın.").
  - **Konu elinin yeri:** İki seçenek: "Dört koltuğa dengeli dağıt (önerilen)" / "Tarifteki koltukta sabit tut".
  - **Konu rengi:** ♠ ♥ ♦ ♣ çoklu seçim ve açıklaması.
- **Dört koltuk bölümü (Kuzey, Doğu, Güney, Batı):** Her birinde "Bu ele koşul koy" onay kutusu. Açılınca şunlar gelir:
  - **HP:** en az – en çok
  - **Dağılım:** Dengeli / Yarı dengeli / Dengesiz (çoklu seçim; hiçbiri seçilmezse fark etmez)
  - **Renk uzunlukları:** ♠ ♥ ♦ ♣ için en az – en çok
  - **Şu renklerden en az biri:** renk seçimi ve uzunluk
  - **Konu rengindeki uzunluk** ve "Konu rengi bu elin açacağı renk" (konu rengi seçiliyse)
  - **Gelişmiş** (açılır-kapanır bölüm): Kontrol, Kaybeden löve (LTC), **Hariç tut** listesi ("Hariç tutma ekle", her birinde HP + dağılım + Kaldır)
- **İki ortaklık bölümü (KG, DB):** "Bu ortaklığa koşul koy". Toplam HP, ortak fit uzunluğu, fit renkleri.
- Hatalı girişte liste halinde uyarılar: "Uygulamadan önce şunları düzeltin: …"
- **Alt bar:** **Vazgeç** · **Uygula**

Form uzundur; telefonda kaydırılarak kullanılır.

### 5.3 Seti kaydet (pencere)

- Başlık: "Seti kaydet"
- **Set adı:** Önerilen değer "Takeout kontr · 10.10.2026", düzenlenebilir.
- **Genel not (isteğe bağlı):** Çok satırlı ("Örn. 3. ders, 1NT sonrası Stayman pratiği").
- **Vazgeç** · **Kaydet** (kaydederken "Kaydediliyor…"). Hata olursa mesaj.

### 5.4 Setlerim (`/sets`)

**Amaç:** Kayıtlı setleri bulmak ve yönetmek.

- **Başlık:** "Setlerim". Sağda **Arşivlenenleri göster** onay kutusu.
- **Liste** (en yeni üstte), her satırda:
  - **Set adı** (tıklanınca set sayfası açılır). Arşivdeyse "Arşivde" etiketi ve soluk görünüm.
  - Alt satırda konu · board sayısı · oluşturulma tarihi ("1 Sanzatu açılışı · 16 board · 10 Eki 2026 22:08").
  - Genel not varsa ilk iki satırı.
  - **Eylemler:** **Aç** · **Kopyala** (yeni bir kopya oluşturup onu açar) · **Arşivle / Arşivden çıkar** · **Sil**. Sil, onay sorar: "“Set adı” silinsin mi? Bu işlem geri alınamaz."
- **Durumlar:** "Setler yükleniyor…", boş durumda "Henüz kayıtlı set yok. El Atölyesi'nde bir set üretip “Kaydet”e basın.", hata mesajı.

### 5.5 Set sayfası (`/sets/:id`)

**Amaç:** Kayıtlı bir seti açmak, düzenlemek ve kullanmak.

- Üstte **← Setlerim** bağlantısı.
- **Bilgi alanı:**
  - **Set adı** (düzenlenebilir kutu)
  - Sağda bilgiler: Konu, Oluşturulma tarihi
  - **Genel not** (düzenlenebilir, çok satırlı)
  - **Eylemler:** **Değişiklikleri kaydet** (yalnızca değişiklik varsa etkin; sonra "Kaydedildi.") · **Kopyala** · **Arşivle / Arşivden çıkar** ("Arşivde" etiketi)
- **Board alanı üst satırı:**
  - "16 board"; analiz sürüyorsa "Çift kukla: 7/16"
  - **Sadece konu eli** · **Bağlantıyı paylaş** · **PDF indir** · **PBN indir**
- **Board ızgarası:** El Atölyesi'ndekiyle aynı kartlar; notu olan board'larda "Not var".
- **Büyük görünüm** board notu alanıyla birlikte.
- **Durumlar:** "Setler yükleniyor…", "Set bulunamadı." (silinmiş ya da hatalı bağlantı).

### 5.6 Hakkında (`/about`)

- Kısa tanıtım metni.
- **"Kullanılan açık kaynak yazılımlar"** listesi; bağlantılarıyla DDS (çift kukla çözücüsü), bridge-dds, jsPDF ve DejaVu Sans. Lisans gereği atıflar.

---

## 6. Uygulamanın ürettiği çıktılar

### PDF (yazdırma)

- A4 dikey, sayfa başına 6 board (2 sütun × 3 satır).
- **Sayfa başlığı:** Set ya da konu adı. Altında "Konu: … · 16 board · 10 Eki 2026" ("Sadece konu eli" açıksa bu da yazılır). Kayıtlı sette ilk sayfada genel not.
- **Her board kutusu:** Başlık satırı, pusula düzeninde eller ve ortada board kutusu. Sol alt köşede par, sağ alt köşede küçük çift kukla tablosu (öğrenci kopyasında yok).
- **Alt bilgi:** Solda tıklanabilir paylaşım bağlantısı (sığmazsa "Briçhane"), sağda "Sayfa 1/3".
- Logo ileride PDF başlığında da kullanılabilir.

### PBN dosyası

- Görsel değil; metin dosyası. Bridge Composer, BBO ve kart dağıtma makinelerinde açılır.

### Paylaşım bağlantısı

- `https://brichane-0.web.app/?v=1&konu=stayman&el=16&kod=…` biçiminde. WhatsApp vb. uygulamalarda paylaşılır.

---

## 7. Kullanım koşulları ve kısıtlar

- **Mobil öncelik:** Hoca derste telefondan kullanıyor. Bütün ekranlar telefonda (≈390 px genişlik) yatay kaydırma olmadan çalışmalı.
- **Uzun içerik:** Bir sette 16 (en fazla 128) board olabilir; ızgara uzun bir sayfa oluşturur.
- **Yoğun bilgi:** Board kartı küçük bir alanda çok bilgi taşır: 4 el × 4 satır, board kutusu ve 5×4 tablo.
- **Kart metinleri:** Uzun renklerde bir satırda 13 karta kadar çıkabilir (örn. "♣ A K Q J 10 9 8 7 6 5 4 3 2").
- **Türkçe karakterler** her yerde doğru görünmeli (ç, ğ, ı, İ, ö, ş, ü).
- **Teknik yapı (bilgi için):** React + Tailwind CSS ile yazılmış tek sayfalık web uygulaması; Firebase üzerinde yayında. Arayüz metinleri tek bir dosyada toplanır.

---

## 8. Yakında gelecek bölümler (tasarımda yer açılması için)

Hoca denemesinden sonra eklenecek; şimdilik yok:

- **Üyelik / giriş:** E-posta ve Google ile giriş, kayıt, profil. Roller: hoca, öğrenci.
- **Abonelik:** Aylık ve yıllık plan seçimi, ödeme (iyzico), abonelik durumu ve bitiş tarihi.
- **Kişisel set sınırı:** Her kullanıcı için son 10 set tutulur. 10 set doluyken kaydetmeye çalışınca "en eski set silinecek" uyarısı çıkar.
- **Ders notları:** Konu başına ders notu sayfası (zengin metin ve içine gömülü el diyagramları). Akış "konu → ders notu → örnek eller" şeklinde olacak.
- **Yasal sayfalar:** Mesafeli satış sözleşmesi, KVKK aydınlatma metni.

---

## 9. Logo için bilgiler

- **Ad:** Briçhane ("briç" + "hane"; "briç evi" anlamında). Yazımı "ç" harfiyle "Briçhane"; teknik adresler ve dosya adlarında "brichane".
- **Ne yapar:** Briç dersleri için el üretir, analiz eder ve yazdırılabilir setler hazırlar.
- **Kimler için:** Briç hocaları ve öğrencileri, Türkiye.
- **Logonun kullanılacağı yerler:** Üst bardaki uygulama adı, tarayıcı sekmesi simgesi (favicon), telefonda ana ekrana eklenince uygulama simgesi, PDF çıktısının başlığı ve ileride abonelik/giriş ekranları.
