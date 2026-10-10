import { describe, expect, it } from 'vitest'
import { BOARDS_PER_PAGE, PAGE, boardCells, pageCount, pdfFileName } from './pdfLayout'

describe('boardCells', () => {
  const cells = boardCells()

  it('places 6 boards per page in reading order', () => {
    expect(cells).toHaveLength(BOARDS_PER_PAGE)
    expect(cells[0].x).toBeLessThan(cells[1].x)
    expect(cells[0].y).toBe(cells[1].y)
    expect(cells[2].y).toBeGreaterThan(cells[0].y)
  })

  it('keeps every cell inside the printable area without overlap', () => {
    for (const c of cells) {
      expect(c.x).toBeGreaterThanOrEqual(PAGE.margin)
      expect(c.x + c.w).toBeLessThanOrEqual(PAGE.w - PAGE.margin + 1e-9)
      expect(c.y).toBeGreaterThanOrEqual(PAGE.margin + PAGE.headerH)
      expect(c.y + c.h).toBeLessThanOrEqual(PAGE.h - PAGE.margin - PAGE.footerH + 1e-9)
    }
    expect(cells[0].x + cells[0].w).toBeLessThan(cells[1].x)
    expect(cells[0].y + cells[0].h).toBeLessThan(cells[2].y)
  })

  it('leaves enough room for a board diagram', () => {
    expect(cells[0].w).toBeGreaterThan(85)
    expect(cells[0].h).toBeGreaterThan(75)
  })
})

describe('pageCount', () => {
  it('rounds up and never returns zero', () => {
    expect(pageCount(16)).toBe(3)
    expect(pageCount(6)).toBe(1)
    expect(pageCount(7)).toBe(2)
    expect(pageCount(0)).toBe(1)
  })
})

describe('pdfFileName', () => {
  it('transliterates Turkish and keeps it ASCII', () => {
    expect(pdfFileName('1 Sanzatu açılışı', 'k7m2xq9p')).toBe(
      'brichane-1-sanzatu-acilisi-k7m2xq9p.pdf',
    )
    expect(pdfFileName('Şlem · İleri Düzey', 'Ders 5')).toBe('brichane-slem-ileri-duzey-ders-5.pdf')
  })

  it('handles empty parts', () => {
    expect(pdfFileName('', '')).toBe('brichane.pdf')
  })
})
