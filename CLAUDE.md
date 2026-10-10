# Briçhane

Konuya göre briç eli üreten, çift kukla analizi yapan ve setleri PBN/baskı olarak veren web uygulaması.
Tam plan ve faz durumu: [brichane_plan.md](brichane_plan.md) — bir fazı bitirince oradaki **İlerleme** listesinde işaretle.

## Teknoloji

Vite + React + TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Vitest, ESLint + Prettier.
Ağır işler (el üretimi, DDS) Web Worker'da. Veri Firestore'da, yayın Firebase Hosting. Bu etapta Auth yok.

## Komutlar

- `npm run dev` — geliştirme sunucusu
- `npm test` — testler (tek sefer), `npm run test:watch` — izleme modu
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run build` — tip kontrolü + üretim derlemesi (`dist/`)
- `npm run deploy` — derle + Firebase Hosting'e yayınla (https://brichane-0.web.app)
- `npm run deploy:preview` — 7 günlük önizleme kanalı (canlıyı bozmadan link paylaşmak için)
- `npm run deploy:rules` — Firestore kuralları ve indeksleri

## Kod kuralları

- Kod (değişken, fonksiyon, dosya adları) **İngilizce**, arayüz metinleri **Türkçe**.
- Tüm arayüz metinleri `src/i18n/tr.ts` içinde; bileşenlerde doğrudan metin yazma.
- `src/engine/` React'ten tamamen bağımsız, saf TypeScript. React, DOM veya Firebase import etmez.
- Motordaki her davranış Vitest ile test edilir (`*.test.ts`, test edilen dosyanın yanında).
- Teknik kimlikler ASCII: paket adı, Firebase proje kimliği ve URL `brichane`; "Briçhane" yalnızca arayüzde.
- `.env` git'e girmez; Firebase ayarları `VITE_FIREBASE_*` değişkenleriyle.

## Motor (`src/engine/`) özeti

- Kart = `suit * 13 + rank`; renk sırası ♠ ♥ ♦ ♣ (0–3), rank 0 = 2 … 12 = A. `Deal = Record<Seat, Hand>`.
- Tüm rastgelelik `Rng` üzerinden; üretici her zaman tohumlu çalışır (tohum verilmezse rastgele tohum üretip sonuçta döner), böylece her set tekrar üretilebilir. Kullanıcı tohumu görmez; paylaşım bağlantısının içinde taşınır (`src/data/shareLink.ts`).
- **Üretim çıktısını değiştiren her değişiklik paylaşılmış bağlantıları bozar.** `src/data/golden.test.ts` bunu yakalar; bilerek yapılıyorsa `SHARE_VERSION` artırılır ve beklenen değerler güncellenir.
- Tarif (`Recipe`) modeli `recipe.ts` içinde; koltuk ve ortaklık kısıtları, `anySuit` ("♥ veya ♠ 5+"), `exclude` ("1NT eli değil"), `fit`.
- Tarifler Güney dağıtıcıymış gibi yazılır. `placement: 'balanced'` (varsayılan) dağıtımı board'un standart dağıtıcısına çevirir; konu eli dört koltuğa eşit dağılır. Konu açıklamaları bu yüzden koltuk adı değil rol kullanır ("Açan:", "ortağı:").
- `generateDeals` reddetme örneklemesi yapar; `dealWorker.ts` bunu Web Worker'da çalıştırır.
- `topicSuit` (konu rengi): tarifte izin verilen renklerden biri seçilir, koltukların `topicSuit` aralığı aynı renge uygulanır (takeout kontr: rakip X'te 5+, kontr eden X'te 0–1).
- Çift kukla: `dd.ts` (modeller, DDS tablo/hex dönüşümleri, par ayrıştırma). Hesap `workers/ddsWorker.ts` (bridge-dds, WebAssembly), havuz `hooks/useDdAnalysis.ts` (en fazla 3 işçi). DDS tablo sırası ♠ ♥ ♦ ♣ NT × K D G B; gösterim ♣ ♦ ♥ ♠ NT.
- Ortak test verileri: `src/engine/testFixtures.ts`.

## Konular (`src/data/`)

- **Kullanıcılar konu yönetmez.** Hazır konu listesi `topics.ts` içinde sabit; yeni konuyu geliştirici ekler. Konular için Firestore yok.
- Ana sayfadaki seçicide "Özel dağılım…" (`CUSTOM_TOPIC_ID`) → `CustomTopicDialog` + `TopicForm`; anlık kullanılır, kaydedilmez.
- `topicDraft.ts`: form modeli (tam aralık = koşul yok) ↔ `Recipe` dönüşümü ve doğrulama.
- Bir sete kaydederken tarifin kopyası da saklanmalı (özel dağılımın kalıcı bir kaydı yok).

## Firebase (`src/firebase/`)

- Proje kimliği `brichane-0` (`.firebaserc`), Firestore `europe-west3`. Ayarlar `.env` (`VITE_FIREBASE_*`, örnek: `.env.example`).
- Firestore'da yalnızca `sets/{id}` (+ `boardNotes/{board}`). Kurallar `firestore.rules`: okuma açık, oluşturmada şema doğrulama, güncellemede yalnızca `title/notes/archived`, **silme kapalı**. Kural değişince `npm run deploy:rules`.
- Çift kukla sonuçları sette `dd` (board başına 20 haneli PBN DoubleDummyTricks: K D G B × NT ♠ ♥ ♦ ♣) ve `par` ({score, contracts}) olarak; kurallar yalnızca henüz yoksa bir kez yazmaya izin verir.
- Firebase yalnızca set sayfalarında ve "Kaydet"te dinamik yüklenir (ana sayfa paketi küçük kalsın).
- App Check: `VITE_RECAPTCHA_SITE_KEY` tanımlıysa açılır.
- Test verisini temizlemek için (kurallar silmeye izin vermez): `firebase firestore:delete sets/<id> --recursive --force`.

## Klasör yapısı

```
src/
  engine/        # saf briç mantığı (kart, el, kısıt, üretici, PBN)
  workers/       # dealWorker.ts, ddsWorker.ts
  data/          # varsayılan konu tarifleri
  firebase/      # app.ts (init, App Check), sets.ts (Firestore erişimi)
  components/    # HandView, DealCard, DealDialog, TopicSelect, CustomTopicDialog, topicForm/
  hooks/         # useDealGenerator (Worker yönetimi)
  pages/         # GeneratePage, SetsPage, SetDetailPage (Print sonra)
  i18n/tr.ts     # arayüz metinleri
```
