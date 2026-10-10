import { useState } from 'react'
import { Link } from 'react-router'
import { groupByCategory } from '../data/topics'
import { useTopics } from '../hooks/topicsContext'
import { tr } from '../i18n/tr'

const linkButton = 'rounded-md px-2.5 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50'

export function TopicsPage() {
  const { topics, loading, error, setArchived } = useTopics()
  const [showArchived, setShowArchived] = useState(false)

  if (loading) return <p className="text-slate-500">{tr.topics.loading}</p>
  if (error) return <p className="text-red-700">{`${tr.topics.loadError} ${error}`}</p>

  const visible = topics.filter((topic) => showArchived || !topic.archived)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{tr.topics.title}</h2>
          <p className="text-sm text-slate-500">{tr.topics.storageNote}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
              className="size-4 accent-emerald-700"
            />
            {tr.topics.showArchived}
          </label>
          <Link
            to="/topics/new"
            className="rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
          >
            + {tr.topics.new}
          </Link>
        </div>
      </div>

      {groupByCategory(visible, (topic) => topic.recipe.category).map(([category, items]) => (
        <section key={category} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
            {category}
          </h3>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
            {items.map((topic) => (
              <li
                key={topic.id}
                className={`flex flex-wrap items-center justify-between gap-2 p-3 ${topic.archived ? 'opacity-60' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{topic.recipe.name}</span>
                    {topic.isDefault && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                        {tr.topics.isDefault}
                      </span>
                    )}
                    {topic.archived && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                        {tr.topics.archived}
                      </span>
                    )}
                  </div>
                  {topic.recipe.description && (
                    <p className="text-sm text-slate-500">{topic.recipe.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {!topic.archived && (
                    <Link to={`/?topic=${encodeURIComponent(topic.id)}`} className={linkButton}>
                      {tr.generate.submit}
                    </Link>
                  )}
                  <Link to={`/topics/${encodeURIComponent(topic.id)}`} className={linkButton}>
                    {tr.topics.edit}
                  </Link>
                  <Link
                    to={`/topics/new?from=${encodeURIComponent(topic.id)}`}
                    className={linkButton}
                  >
                    {tr.topics.copy}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setArchived(topic.id, !topic.archived)}
                    className="rounded-md px-2.5 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    {topic.archived ? tr.topics.unarchive : tr.topics.archive}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
