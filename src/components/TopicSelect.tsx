import { CUSTOM_TOPIC_ID, groupByCategory } from '../data/topics'
import type { Recipe } from '../engine'
import { tr } from '../i18n/tr'

interface TopicSelectProps {
  id: string
  topics: readonly Recipe[]
  value: string
  onChange: (topicId: string) => void
}

/** Kategoriye göre gruplanmış konu seçici; en altta "Özel dağılım…". */
export function TopicSelect({ id, topics, value, onChange }: TopicSelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
    >
      {groupByCategory(topics, (topic) => topic.category).map(([category, items]) => (
        <optgroup key={category} label={category}>
          {items.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </optgroup>
      ))}
      <optgroup label={tr.generate.customGroup}>
        <option value={CUSTOM_TOPIC_ID}>{tr.generate.customOption}</option>
      </optgroup>
    </select>
  )
}
