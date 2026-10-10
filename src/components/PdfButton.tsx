import { useState } from 'react'
import type { DealsPdfOptions } from '../export/dealsPdf'
import { tr } from '../i18n/tr'
import { Button } from './ui/Button'
import { Notice } from './ui/Notice'

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
    <>
      <Button onClick={handleClick} busy={busy} busyLabel={tr.pdf.preparing}>
        {tr.pdf.download}
      </Button>
      {error && (
        <div className="basis-full">
          <Notice tone="danger">{error}</Notice>
        </div>
      )}
    </>
  )
}
