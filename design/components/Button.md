# Button

Eylem düğmesi; dört görünüm, iki boy.

**Tüketici sağlar:** `variant` (`primary` | `secondary` | `quiet` | `danger`), `size` (`md` | `sm`), `busy`, `children` ve normal `<button>` özellikleri.

- **primary** (`felt` dolgu, `on-felt` metin): ekranda tek bir ana eylem — **Üret**, pencerede **Kaydet** / **Uygula**.
- **secondary** (`surface` + `line-strong` kenar): sonuç alanındaki **PDF indir**, **PBN indir**, liste satırında **Aç**.
- **quiet** (zeminsiz): **Bağlantıyı paylaş**, **Kopyala**, **Vazgeç**, **Kapat**.
- **danger** (`danger-ink` metin, zeminsiz): yalnızca **Sil**; her zaman onay sorusuyla birlikte.
- `busy` iken düğme pasifleşir ve etiket "Hazırlanıyor…", "Kaydediliyor…" gibi süren eylemi söyler. Üretim sürerken **Üret** düğmesinin yerine aynı yerde **Durdur** (secondary) gelir.
- Yükseklik `control-height` (40px), küçük boy 32px. Etiketler fiil, Türkçe ve kısa.
