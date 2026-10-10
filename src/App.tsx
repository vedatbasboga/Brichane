import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router'
import { Mark } from './components/ui/Mark'
import { tr } from './i18n/tr'
import { GeneratePage } from './pages/GeneratePage'

// Setler Firebase'i kullanır; ana sayfa hafif kalsın diye ayrı yüklenir.
const SetsPage = lazy(() => import('./pages/SetsPage'))
const SetDetailPage = lazy(() => import('./pages/SetDetailPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

const navClass = ({ isActive }: { isActive: boolean }) =>
  `bh-nav-link${isActive ? ' is-active' : ''}`

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <header className="bh-topbar">
          <div className="bh-topbar-inner">
            <Link to="/" className="bh-brand">
              <Mark size={28} />
              <span className="bh-brand-name">{tr.appName}</span>
            </Link>
            <nav className="bh-nav" aria-label={tr.nav.label}>
              <NavLink to="/" end className={navClass}>
                {tr.nav.generate}
              </NavLink>
              <NavLink to="/sets" className={navClass}>
                {tr.nav.sets}
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="bh-page w-full flex-1">
          <Suspense fallback={<p className="bh-muted">{tr.sets.loading}</p>}>
            <Routes>
              <Route path="/" element={<GeneratePage />} />
              <Route path="/sets" element={<SetsPage />} />
              <Route path="/sets/:id" element={<SetDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<GeneratePage />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="mx-auto w-full max-w-[var(--content-max)] px-4 pb-6 text-[13px] sm:px-6">
          <Link to="/about" className="text-ink-muted hover:text-ink hover:underline">
            {tr.about.link}
          </Link>
        </footer>
      </div>
    </BrowserRouter>
  )
}
