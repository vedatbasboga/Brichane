import { useState } from 'react'
import type { DealsPdfOptions } from '../export/dealsPdf'
import { tr } from '../i18n/tr'

interface PdfButtonProps {
  /** Tıklama anında çağrılır; güncel "sadece konu eli" durumunu yansıtır. */
  getOptions: () => DealsPdfOptions
}

/** PDF indir; jsPDF ve yazı tipi ilk tıklamada yüklenir. */
export function PdfButton({ getOptions }: PdfButtonProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setBusy(true)
    setError(null)
    try {
      const { downloadDealsPdf } = await import('../export/dealsPdf')
      await downloadDealsPdf(getOptions())
    } catch (err) {
      setError(`${tr.pdf.error} ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="rounded-md border border-emerald-700 px-4 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
      >
        {busy ? tr.pdf.preparing : tr.pdf.download}
      </button>
      {error && <span className="text-sm text-red-700">{error}</span>}
    </span>
  )
}
