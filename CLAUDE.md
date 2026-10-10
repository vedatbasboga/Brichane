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

## Kod kuralları

- Kod (değişken, fonksiyon, dosya adları) **İngilizce**, arayüz metinleri **Türkçe**.
- Tüm arayüz metinleri `src/i18n/tr.ts` içinde; bileşenlerde doğrudan metin yazma.
- `src/engine/` React'ten tamamen bağımsız, saf TypeScript. React, DOM veya Firebase import etmez.
- Motordaki her davranış Vitest ile test edilir (`*.test.ts`, test edilen dosyanın yanında).
- Teknik kimlikler ASCII: paket adı, Firebase proje kimliği ve URL `brichane`; "Briçhane" yalnızca arayüzde.
- `.env` git'e girmez; Firebase ayarları `VITE_FIREBASE_*` değişkenleriyle.

## Motor (`src/engine/`) özeti

- Kart = `suit * 13 + rank`; renk sırası ♠ ♥ ♦ ♣ (0–3), rank 0 = 2 … 12 = A. `Deal = Record<Seat, Hand>`.
- Tüm rastgelelik `Rng` üzerinden; üretici her zaman tohumlu çalışır (tohum boşsa rastgele tohum üretip sonuçta döner), böylece her set tekrar üretilebilir.
- Tarif (`Recipe`) modeli `recipe.ts` içinde; koltuk ve ortaklık kısıtları, `anySuit` ("♥ veya ♠ 5+"), `exclude` ("1SA eli değil"), `fit`.
- Tarifler Güney dağıtıcıymış gibi yazılır. `placement: 'balanced'` (varsayılan) dağıtımı board'un standart dağıtıcısına çevirir; konu eli dört koltuğa eşit dağılır. Konu açıklamaları bu yüzden koltuk adı değil rol kullanır ("Açan:", "ortağı:").
- `generateDeals` reddetme örneklemesi yapar; `dealWorker.ts` bunu Web Worker'da çalıştırır.
- Ortak test verileri: `src/engine/testFixtures.ts`.

## Klasör yapısı

```
src/
  engine/        # saf briç mantığı (kart, el, kısıt, üretici, PBN)
  workers/       # dealWorker.ts, ddsWorker.ts
  data/          # varsayılan konu tarifleri
  firebase/      # firebase init + firestore erişim katmanı
  components/    # HandView, DealCard, DealDialog, TopicSelect...
  hooks/         # useDealGenerator (Worker yönetimi)
  pages/         # Generate, Sets, Topics, Print
  i18n/tr.ts     # arayüz metinleri
```
