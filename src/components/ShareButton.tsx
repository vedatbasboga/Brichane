import { useState } from 'react'
import { tr } from '../i18n/tr'
import { Button } from './ui/Button'

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
    <Button variant="quiet" onClick={handleClick}>
      {copied ? tr.share.copied : tr.share.button}
    </Button>
  )
}
