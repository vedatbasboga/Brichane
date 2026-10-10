# Hand

Bir oyuncunun 13 kartı: başlıkta koltuk harfi ve HP, altında dört renk satırı.

**Tüketici sağlar:** `seat` (`K` | `D` | `G` | `B`), `hp`, `cards` (`{S,H,D,C}` boşlukla ayrılmış dizgeler, ör. `"A K 10 5"`; boş renk `""`), `hidden`, `size` (`md` | `lg`).

- Sıra her zaman ♠ ♥ ♦ ♣. Boş renk "—" (`ink-muted`).
- Kartlar `cards` stilinde (14px, tabular); büyük görünümde `size="lg"` (`cards-lg`).
- 13 kartlık renk dar alanda alt satıra kayar; kayan satır sembolün sağından devam eder.
- `hidden`: öğrenci modunda konu dışı eller "Gizli" yazar, HP gösterilmez.
