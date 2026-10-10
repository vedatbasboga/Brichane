# BoardCard

Board kartı: başlık satırı, pusula düzeninde dört el + board kutusu, altta çift kukla tablosu. El Atölyesi'nde ve set sayfasında ızgara halinde.

**Tüketici sağlar:** `number`, `dealer`, `vuln`, `hands`, `hp`, `dd`, `par`, `parText`, `analyzing`, `hasNote`, `studentMode`, `subjectSeats` (öğrenci modunda açık kalan koltuklar), `onOpen` (büyük görünümü açar).

- Başlık: "Board 3 · Dağıtıcı G · DB zon"; sağda **Not var** ve **Büyüt**. Kartın tamamı tıklanabilir.
- Izgara: `repeat(auto-fill, minmax(var(--board-min), 1fr))`, aralık `space-4`. Telefonda tek sütun, genişte 2–4.
- Zemin `surface`, kenar `line`, köşe `radius-lg`, iç boşluk `space-3`. Gölge yok.
- `studentMode`: `subjectSeats` dışındaki eller "Gizli", tablo gizli.
