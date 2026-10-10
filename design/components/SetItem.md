# SetItem

Setlerim listesinin bir satırı.

**Tüketici sağlar:** `title`, `href`, `meta` ("1 Sanzatu açılışı · 16 board · 10 Eki 2026 22:08"), `note` (ilk iki satır gösterilir), `archived`, `onOpen`, `onCopy`, `onArchive`, `onDelete`.

- `ul` içinde kullanın; kapsayıcıya `line` kenar ve `radius-lg` verin.
- Arşivdeki satır **Arşivde** etiketi alır ve içerik `opacity-archived` ile soluklaşır; eylemler soluklaşmaz.
- **Sil** her zaman onay sorar: "“Set adı” silinsin mi? Bu işlem geri alınamaz."
- Telefonda eylemler başlığın altına iner.
