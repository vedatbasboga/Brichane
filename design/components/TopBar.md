# TopBar

Her sayfanın üstündeki uygulama çubuğu: logo + "Briçhane" ve iki gezinme bağlantısı.

**Tüketici sağlar:** `active` (`"atolye"` | `"setler"`), isteğe bağlı `links` (`{id,label,href}[]`), `homeHref`, sağ uçta `end` (ileride giriş/profil).

- Etkin sayfa `ink` metin + 2px `felt` alt çizgiyle belirtilir; diğerleri `ink-muted`.
- Yükseklik `topbar-height` (56px); zemin `surface`, alt kenar `line`.
- Telefonda (≤480px) aralıklar daralır; yatay kaydırma olmaz.
- Logo işareti satır içi SVG'dir ve tema renklerini (`felt`, `surface`) izler; dosya olarak gereken yerlerde Logos varlıklarını kullanın.
