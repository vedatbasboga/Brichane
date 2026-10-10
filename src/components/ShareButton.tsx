import { useState } from 'react'
import { tr } from '../i18n/tr'

interface ShareButtonProps {
  url: string
  title: string
}

/** Telefonda paylaşım menüsünü açar (WhatsApp vb.), bilgisayarda bağlantıyı kopyalar. */
export function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    const touch = window.matchMedia('(pointer: coarse)').matches
    if (touch && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Pano izni yoksa bağlantıyı elle kopyalamak için göster.
      window.prompt(tr.share.copyPrompt, url)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md border border-emerald-700 px-4 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
    >
      {copied ? tr.share.copied : tr.share.button}
    </button>
  )
}
