import { tr } from '../i18n/tr'

const CREDITS = [
  { text: tr.about.dds, url: 'https://github.com/dds-bridge/dds' },
  { text: tr.about.ddsJs, url: 'https://github.com/bookchris/bridge-dds-js' },
  { text: tr.about.jspdf, url: 'https://github.com/parallax/jsPDF' },
  { text: tr.about.dejavu, url: 'https://dejavu-fonts.github.io/' },
]

export default function AboutPage() {
  return (
    <article className="flex max-w-2xl flex-col gap-4">
      <h2 className="text-2xl font-bold text-slate-900">{tr.about.title}</h2>
      <p className="text-slate-700">{tr.about.intro}</p>
      <h3 className="text-lg font-semibold text-slate-900">{tr.about.creditsTitle}</h3>
      <ul className="list-disc space-y-2 pl-5 text-slate-700">
        {CREDITS.map((credit) => (
          <li key={credit.url}>
            {credit.text}{' '}
            <a
              href={credit.url}
              target="_blank"
              rel="noreferrer"
              className="break-all text-emerald-700 hover:underline"
            >
              {credit.url}
            </a>
          </li>
        ))}
      </ul>
    </article>
  )
}
