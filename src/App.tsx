import { tr } from './i18n/tr'

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-emerald-50 p-4 text-emerald-950">
      <h1 className="text-4xl font-bold">{tr.appName}</h1>
      <p className="text-emerald-800">{tr.tagline}</p>
    </main>
  )
}
