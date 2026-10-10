# BoardBox

Board kutusu: ortada numara, kenarlarda K/D/G/B, zon ve dağıtıcı işareti.

**Tüketici sağlar:** `number`, `dealer` (`K`|`D`|`G`|`B`), `vuln` (`none` | `KG` | `DB` | `all`), `size` (`md` 72px | `lg` 104px).

- Pusula düzeni: K üst, D sağ, G alt, B sol.
- Zonlu tarafın iki kenarı `vuln` şerit, harfi `on-vuln`. Zon yoksa kenarlar `surface-sunken`.
- Dağıtıcının harfinin altı çizili ve kalın.
- Numara `board-number` stilinde (serif, 26px; büyükte 36px).
