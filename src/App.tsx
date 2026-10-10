import { lazy, Suspense } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router'
import { tr } from './i18n/tr'
import { GeneratePage } from './pages/GeneratePage'

// Setler Firebase'i kullanır; ana sayfa hafif kalsın diye ayrı yüklenir.
const SetsPage = lazy(() => import('./pages/SetsPage'))
const SetDetailPage = lazy(() => import('./pages/SetDetailPage'))

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-emerald-900/40 text-white' : 'text-emerald-100 hover:bg-emerald-900/20'
  }`

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-emerald-900/20 bg-emerald-800 text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <h1 className="text-xl font-bold">{tr.appName}</h1>
            <nav className="flex gap-1">
              <NavLink to="/" end className={navClass}>
                {tr.nav.generate}
              </NavLink>
              <NavLink to="/sets" className={navClass}>
                {tr.nav.sets}
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Suspense fallback={<p className="text-slate-500">{tr.sets.loading}</p>}>
            <Routes>
              <Route path="/" element={<GeneratePage />} />
              <Route path="/sets" element={<SetsPage />} />
              <Route path="/sets/:id" element={<SetDetailPage />} />
              <Route path="*" element={<GeneratePage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}
