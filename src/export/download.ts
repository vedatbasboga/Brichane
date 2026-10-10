/** Metni dosya olarak indirir. UTF-8 BOM, Windows programlarının Türkçe karakterleri tanıması için. */
export function downloadText(fileName: string, text: string, mimeType = 'text/plain'): void {
  const blob = new Blob(['﻿', text], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
