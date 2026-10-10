# DDTable

Çift kukla tablosu: satırlar K G D B, sütunlar ♣ ♦ ♥ ♠ NT; altında par satırı.

**Tüketici sağlar:** `rows` (`{K:{C,D,H,S,NT}, …}`; hücre 1–7 ya da `null` → "–"), `par` (`{strain, seats}` vurgulanacak hücreler), `parText` (ör. "4♠ G · KG +420"), `analyzing`, `size`.

- Par kontrat hücresi `par` sarı zemin + kalın `ink`. Başka vurgu yok.
- Başlık satırı ve sütunu `surface-sunken`; hücre çizgileri `line`.
- `analyzing` iken tablo yerine "Çift kukla hesaplanıyor…".
- Öğrenci modunda tablo hiç gösterilmez (BoardCard bunu yapar).
