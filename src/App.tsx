import { BrowserRouter, NavLink, Route, Routes } from 'react-router'
import { TopicsProvider } from './components/TopicsProvider'
import { createLocalTopicRepository } from './data/topicStore'
import { tr } from './i18n/tr'
import { GeneratePage } from './pages/GeneratePage'
import { TopicEditPage } from './pages/TopicEditPage'
import { TopicsPage } from './pages/TopicsPage'

const topicRepository = createLocalTopicRepository()

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-emerald-900/40 text-white' : 'text-emerald-100 hover:bg-emerald-900/20'
  }`

export default function App() {
  return (
    <BrowserRouter>
      <TopicsProvider repository={topicRepository}>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <header className="border-b border-emerald-900/20 bg-emerald-800 text-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
              <h1 className="text-xl font-bold">{tr.appName}</h1>
              <nav className="flex gap-1">
                <NavLink to="/" end className={navClass}>
                  {tr.nav.generate}
                </NavLink>
                <NavLink to="/topics" className={navClass}>
                  {tr.nav.topics}
                </NavLink>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6">
            <Routes>
              <Route path="/" element={<GeneratePage />} />
              <Route path="/topics" element={<TopicsPage />} />
              <Route path="/topics/new" element={<TopicEditPage />} />
              <Route path="/topics/:id" element={<TopicEditPage />} />
            </Routes>
          </main>
        </div>
      </TopicsProvider>
    </BrowserRouter>
  )
}
