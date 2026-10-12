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
- Yeni hazır konular: Jacoby transfer (♥/♠ ayrı), 2♣ güçlü açış, splinter, Blackwood/RKCB, Michaels/Unusual NT, preemptif açılışlar (3'lü), dengeleme (balancing), negatif kontr.
- Konu açıklamasına kısa "derste ne sorulur" notu.

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
