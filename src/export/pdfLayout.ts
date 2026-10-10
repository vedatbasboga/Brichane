// PDF sayfa yerleşimi ve dosya adı (jsPDF'ten bağımsız, test edilebilir).

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** A4 dikey, milimetre. */
export const PAGE = { w: 210, h: 297, margin: 12, headerH: 18, footerH: 8, gap: 5 }
export const GRID = { cols: 2, rows: 3 }
export const BOARDS_PER_PAGE = GRID.cols * GRID.rows

/** Bir sayfadaki board kutuları, soldan sağa, yukarıdan aşağı. */
export function boardCells(page = PAGE, grid = GRID): Rect[] {
  const top = page.margin + page.headerH
  const usableW = page.w - 2 * page.margin
  const usableH = page.h - top - page.margin - page.footerH
  const w = (usableW - (grid.cols - 1) * page.gap) / grid.cols
  const h = (usableH - (grid.rows - 1) * page.gap) / grid.rows
  const cells: Rect[] = []
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      cells.push({ x: page.margin + col * (w + page.gap), y: top + row * (h + page.gap), w, h })
    }
  }
  return cells
}

export function pageCount(boards: number, perPage = BOARDS_PER_PAGE): number {
  return Math.max(1, Math.ceil(boards / perPage))
}

const TURKISH_ASCII: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
}

/** Örn. ("1 Sanzatu açılışı", "2026-10-10") → "brichane-1-sanzatu-acilisi-2026-10-10.pdf". */
export function pdfFileName(title: string, suffix: string): string {
  const slug = (text: string) =>
    text
      .replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => TURKISH_ASCII[ch])
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
  return ['brichane', slug(title), slug(suffix)].filter(Boolean).join('-') + '.pdf'
}
