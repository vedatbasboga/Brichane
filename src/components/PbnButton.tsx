import { downloadText } from '../export/download'
import { exportFileName } from '../export/pdfLayout'
import { buildPbnFile, type PbnExportOptions } from '../export/pbnFile'
import { tr } from '../i18n/tr'
import { Button } from './ui/Button'

interface PbnButtonProps {
  /** Tıklama anında çağrılır; o ana kadar biten çift kukla sonuçları dahil edilir. */
  getOptions: () => PbnExportOptions
}

/** Bridge Composer, BBO ve kart dağıtma makineleri için PBN dosyası. */
export function PbnButton({ getOptions }: PbnButtonProps) {
  function handleClick() {
    const options = getOptions()
    const d = options.date
    const pad = (n: number) => String(n).padStart(2, '0')
    const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    downloadText(exportFileName(options.event, day, 'pbn'), buildPbnFile(options))
  }

  return (
    <Button onClick={handleClick} title={tr.pbn.help}>
      {tr.pbn.download}
    </Button>
  )
}
