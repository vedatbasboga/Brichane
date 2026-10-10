import { describe, expect, it } from 'vitest'
import { tr } from './tr'

describe('tr messages', () => {
  it('has the app name', () => {
    expect(tr.appName).toBe('Briçhane')
  })
})
