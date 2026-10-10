import { CUSTOM_TOPIC_ID, groupByCategory } from '../data/topics'
import type { Recipe } from '../engine'
import { tr } from '../i18n/tr'
import { Select } from './ui/Field'

interface TopicSelectProps {
  id: string
  topics: readonly Recipe[]
  value: string
  onChange: (topicId: string) => void
}

/** Kategoriye göre gruplanmış konu seçici; en altta "Özel dağılım…". */
export function TopicSelect({ id, topics, value, onChange }: TopicSelectProps) {
  return (
    <Select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
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
    </Select>
  )
}
