# Dialog

Pencere: Özel dağılım, Seti kaydet ve board büyük görünümü için.

**Tüketici sağlar:** `title`, `description`, `children`, `footer` (düğmeler), `onClose`, `size` (`md` 520px | `lg` 760px), `inline` (perdesiz, yalnızca panel).

- Perde `backdrop`, panel `surface` + `radius-lg` + `shadow-dialog` (sistemdeki tek gölge).
- Esc ve perdeye tıklama `onClose` çağırır; başlıkta **Kapat** düğmesi.
- Alt bar sağa yaslıdır: **Vazgeç** (quiet) · **Kaydet** / **Uygula** (primary).
- Uzun formlar (Özel dağılım) sayfa gibi kayar; telefonda kenar boşluğu `space-3`.
- Büyük görünümde ← → board değiştirir; bu tuşları tüketici bağlar.
