import { BrowserRouter, Route, Routes } from 'react-router'
import { tr } from './i18n/tr'
import { GeneratePage } from './pages/GeneratePage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-emerald-900/20 bg-emerald-800 text-white">
          <div className="mx-auto flex max-w-7xl items-baseline gap-3 px-4 py-3">
            <h1 className="text-xl font-bold">{tr.appName}</h1>
            <span className="text-sm text-emerald-100">{tr.generate.title}</span>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Routes>
            <Route path="*" element={<GeneratePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
