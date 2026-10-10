// Board'ları A4 PDF olarak indirir (sayfa başına 6 board). jsPDF ve yazı tipi
// yalnızca bu modül yüklendiğinde (PDF indir'e basılınca) indirilir.

import boldFontUrl from 'dejavu-fonts-ttf/ttf/DejaVuSansCondensed-Bold.ttf?url'
import regularFontUrl from 'dejavu-fonts-ttf/ttf/DejaVuSansCondensed.ttf?url'
import { jsPDF } from 'jspdf'
import { dealCaption } from '../components/format'
import type { DealView } from '../data/savedSet'
import {
  SUITS,
  SUIT_SYMBOLS,
  handBySuit,
  hcp,
  isVulnerable,
  rankLabel,
  type Hand,
  type Seat,
  type Suit,
  type Vulnerability,
} from '../engine'
import { tr } from '../i18n/tr'
import { BOARDS_PER_PAGE, PAGE, boardCells, pageCount, pdfFileName, type Rect } from './pdfLayout'

export interface DealsPdfOptions {
  title: string
  topicName: string
  seed: string
  deals: DealView[]
  /** Sadece konu elleri çizilir (öğrenci kopyası). */
  focusOnly: boolean
  notes?: string
  date?: Date | null
}

type Rgb = [number, number, number]

const FONT = 'DejaVu'
const COLOR: Record<'text' | 'muted' | 'red' | 'hcp' | 'border' | 'box' | 'white', Rgb> = {
  text: [15, 23, 42],
  muted: [100, 116, 139],
  red: [220, 38, 38],
  hcp: [4, 120, 87],
  border: [203, 213, 225],
  box: [241, 245, 249],
  white: [255, 255, 255],
}
const SUIT_COLOR: Record<Suit, Rgb> = { S: COLOR.text, H: COLOR.red, D: COLOR.red, C: COLOR.text }

const LINE_H = 3.9
const HAND_FONT = 9
const SYMBOL_W = 3.6
const COMPASS = 17

const dateFormat = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' })

export async function downloadDealsPdf(options: DealsPdfOptions): Promise<void> {
  const [regular, bold] = await Promise.all([loadFont(regularFontUrl), loadFont(boldFontUrl)])
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  doc.addFileToVFS('DejaVu.ttf', regular)
  doc.addFont('DejaVu.ttf', FONT, 'normal')
  doc.addFileToVFS('DejaVu-Bold.ttf', bold)
  doc.addFont('DejaVu-Bold.ttf', FONT, 'bold')
  doc.setProperties({ title: options.title, creator: tr.appName })

  const pages = pageCount(options.deals.length)
  const cells = boardCells()
  for (let page = 0; page < pages; page++) {
    if (page > 0) doc.addPage()
    drawHeader(doc, options, page === 0)
    options.deals
      .slice(page * BOARDS_PER_PAGE, (page + 1) * BOARDS_PER_PAGE)
      .forEach((deal, i) => drawBoard(doc, deal, cells[i], options.focusOnly))
    drawFooter(doc, page + 1, pages)
  }
  doc.save(pdfFileName(options.title, options.seed))
}

async function loadFont(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Font ${response.status}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

function setText(doc: jsPDF, color: Rgb, size: number, style: 'normal' | 'bold' = 'normal') {
  doc.setTextColor(...color)
  doc.setFontSize(size)
  doc.setFont(FONT, style)
}

function drawHeader(doc: jsPDF, options: DealsPdfOptions, firstPage: boolean) {
  const x = PAGE.margin
  const maxW = PAGE.w - 2 * PAGE.margin
  setText(doc, COLOR.text, 14, 'bold')
  doc.text(fit(doc, options.title, maxW), x, PAGE.margin + 5)

  const parts = [
    `${tr.pdf.topic}: ${options.topicName}`,
    `${tr.pdf.seed}: ${options.seed}`,
    tr.sets.boards(options.deals.length),
    dateFormat.format(options.date ?? new Date()),
  ]
  if (options.focusOnly) parts.push(tr.generate.focusOnly)
  setText(doc, COLOR.muted, 8.5)
  doc.text(fit(doc, parts.join(' · '), maxW), x, PAGE.margin + 10.5)

  if (firstPage && options.notes?.trim()) {
    setText(doc, COLOR.text, 8.5)
    doc.text(fit(doc, options.notes.trim().replace(/\s+/g, ' '), maxW), x, PAGE.margin + 15.5)
  }
}

function drawFooter(doc: jsPDF, page: number, pages: number) {
  const y = PAGE.h - PAGE.margin - 1
  setText(doc, COLOR.muted, 7.5)
  doc.text(tr.appName, PAGE.margin, y)
  doc.text(tr.pdf.page(page, pages), PAGE.w - PAGE.margin, y, { align: 'right' })
}

function drawBoard(doc: jsPDF, deal: DealView, cell: Rect, focusOnly: boolean) {
  doc.setDrawColor(...COLOR.border)
  doc.setLineWidth(0.3)
  doc.roundedRect(cell.x, cell.y, cell.w, cell.h, 2, 2, 'S')

  setText(doc, COLOR.muted, 7.5)
  doc.text(dealCaption(deal), cell.x + 3, cell.y + 5)

  const pad = 3
  const colW = (cell.w - 2 * pad) / 3
  const blockH = LINE_H * 5
  const contentH = 3 * blockH + 2
  const top = cell.y + 8 + Math.max(0, (cell.h - 8 - contentH) / 2)
  const col = (i: number) => cell.x + pad + i * colW
  const row = (i: number) => top + i * (blockH + 1)

  const hidden = (seat: Seat) => focusOnly && !deal.focusSeats.includes(seat)
  drawHand(doc, deal.hands.N, 'N', col(1), row(0), colW, hidden('N'))
  drawHand(doc, deal.hands.W, 'W', col(0), row(1), colW, hidden('W'))
  drawHand(doc, deal.hands.E, 'E', col(2), row(1), colW, hidden('E'))
  drawHand(doc, deal.hands.S, 'S', col(1), row(2), colW, hidden('S'))
  drawCompass(
    doc,
    col(1) + (colW - COMPASS) / 2,
    row(1) + (blockH - COMPASS) / 2,
    deal.board,
    deal.dealer,
    deal.vul,
  )
}

function drawHand(
  doc: jsPDF,
  hand: Hand,
  seat: Seat,
  x: number,
  y: number,
  maxW: number,
  hidden: boolean,
) {
  setText(doc, COLOR.muted, 7.5, 'bold')
  doc.text(tr.seats[seat], x, y + 3)
  if (hidden) return
  const labelW = doc.getTextWidth(tr.seats[seat] + ' ')
  setText(doc, COLOR.hcp, 7.5, 'bold')
  doc.text(`${hcp(hand)} ${tr.hcp}`, x + labelW, y + 3)

  const bySuit = handBySuit(hand)
  SUITS.forEach((suit, i) => {
    const baseline = y + 3 + (i + 1) * LINE_H
    setText(doc, SUIT_COLOR[suit], HAND_FONT)
    doc.text(SUIT_SYMBOLS[suit], x, baseline)

    const ranks = bySuit[suit].map(rankLabel)
    const available = maxW - SYMBOL_W - 1
    setText(doc, COLOR.text, HAND_FONT)
    let text = ranks.join(' ') || '—'
    // Uzun renkler sütuna sığmazsa önce boşluklar kalkar, sonra yazı küçülür.
    if (doc.getTextWidth(text) > available) text = ranks.join('')
    const width = doc.getTextWidth(text)
    if (width > available) doc.setFontSize((HAND_FONT * available) / width)
    doc.text(text, x + SYMBOL_W, baseline)
  })
}

function drawCompass(
  doc: jsPDF,
  x: number,
  y: number,
  board: number,
  dealer: Seat,
  vul: Vulnerability,
) {
  const size = COMPASS
  const edge = size * 0.24
  const edges: Record<Seat, Rect> = {
    N: { x, y, w: size, h: edge },
    S: { x, y: y + size - edge, w: size, h: edge },
    W: { x, y: y + edge, w: edge, h: size - 2 * edge },
    E: { x: x + size - edge, y: y + edge, w: edge, h: size - 2 * edge },
  }
  for (const seat of ['N', 'E', 'S', 'W'] as const) {
    const r = edges[seat]
    const vulnerable = isVulnerable(vul, seat)
    doc.setFillColor(...(vulnerable ? COLOR.red : COLOR.box))
    doc.rect(r.x, r.y, r.w, r.h, 'F')
    setText(doc, vulnerable ? COLOR.white : COLOR.muted, 6, 'bold')
    const cx = r.x + r.w / 2
    const cy = r.y + r.h / 2
    doc.text(tr.seats[seat], cx, cy, { align: 'center', baseline: 'middle' })
    if (seat === dealer) {
      const w = doc.getTextWidth(tr.seats[seat])
      doc.setDrawColor(...(vulnerable ? COLOR.white : COLOR.muted))
      doc.setLineWidth(0.3)
      doc.line(cx - w / 2, cy + 1.2, cx + w / 2, cy + 1.2)
    }
  }
  doc.setFillColor(...COLOR.white)
  doc.rect(x + edge, y + edge, size - 2 * edge, size - 2 * edge, 'F')
  doc.setDrawColor(...COLOR.border)
  doc.setLineWidth(0.3)
  doc.rect(x, y, size, size, 'S')
  setText(doc, COLOR.text, 11, 'bold')
  doc.text(String(board), x + size / 2, y + size / 2, { align: 'center', baseline: 'middle' })
}

/** Genişliği aşan metni "…" ile kısaltır. */
function fit(doc: jsPDF, text: string, maxW: number): string {
  if (doc.getTextWidth(text) <= maxW) return text
  let end = text.length
  while (end > 0 && doc.getTextWidth(text.slice(0, end) + '…') > maxW) end--
  return text.slice(0, end) + '…'
}
