# Notice

Sayfa içi bildirim kutusu; ikon + metin, gerekirse bir bağlantı.

**Tüketici sağlar:** `tone` (`info` | `success` | `warning` | `danger`), `title`, `children`, `action`.

- `info`: boş durum ("Bir konu seçip “Üret”e basın."), paylaşım bağlantısı uyarısı.
- `success`: "Set kaydedildi." + **Setlerim'de aç**.
- `warning`: nadir koşul ("Bu koşulda el bulunamadı, aralıkları genişletin.") + bulunan el sayısı ve gözlenen olasılık.
- `danger`: "Üretim sırasında hata oluştu: …".
- Ton yalnızca renkle anlatılmaz: her tonun ikonu farklıdır.
