# Field

Etiketli form alanı: `Field` bir `Input`, `Select` ya da `textarea.bh-input` sarar; ipucu veya hata satırını bağlar.

**Tüketici sağlar:** `label`, `hint` (ör. seçili konunun açıklaması), `error` (geçersiz değer), `children` (tek kontrol).

- Etiket her zaman kontrolün üstünde (`label` stili). Yer tutucu metni etiketin yerine kullanmayın.
- `error` verildiğinde kenarlık `danger-line`, mesaj `danger-ink` olur; mesaj ne yapılacağını söyler: "1 ile 128 arasında bir sayı girin."
- Konu seçici kategorilere göre `optgroup` kullanır; "Özel dağılım…" en altta.
- Kontroller `surface` zeminli, `line-strong` kenarlı, 40px yüksekliktedir.
