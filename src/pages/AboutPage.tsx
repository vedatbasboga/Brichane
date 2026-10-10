import { Mark } from '../components/ui/Mark'
import { tr } from '../i18n/tr'

const CREDITS = [
  { text: tr.about.dds, url: 'https://github.com/dds-bridge/dds' },
  { text: tr.about.ddsJs, url: 'https://github.com/bookchris/bridge-dds-js' },
  { text: tr.about.jspdf, url: 'https://github.com/parallax/jsPDF' },
  { text: tr.about.dejavu, url: 'https://dejavu-fonts.github.io/' },
  { text: tr.about.fonts, url: 'https://openfontlicense.org/' },
]

export default function AboutPage() {
  return (
    <article className="flex max-w-2xl flex-col gap-5">
      <div className="flex items-center gap-3">
        <Mark size={48} />
        <h1 className="bh-display">{tr.about.title}</h1>
      </div>
      <p className="m-0">{tr.about.intro}</p>
      <h2 className="bh-heading">{tr.about.creditsTitle}</h2>
      <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
        {CREDITS.map((credit) => (
          <li key={credit.url}>
            {credit.text}{' '}
            <a href={credit.url} target="_blank" rel="noreferrer" className="bh-link break-all">
              {credit.url}
            </a>
          </li>
        ))}
      </ul>
    </article>
  )
}
