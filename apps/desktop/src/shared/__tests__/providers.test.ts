import { describe, expect, it } from 'vitest'
import { createCustomProvider, PROVIDER_CATALOG } from '../providers'

describe('PROVIDER_CATALOG', () => {
  it('has unique ids', () => {
    const ids = PROVIDER_CATALOG.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every provider has a name and a valid https url', () => {
    for (const provider of PROVIDER_CATALOG) {
      expect(provider.name.length).toBeGreaterThan(0)
      expect(provider.url.startsWith('https://')).toBe(true)
    }
  })

  it('every provider declares at least one mode', () => {
    for (const provider of PROVIDER_CATALOG) {
      expect(provider.modes.length).toBeGreaterThan(0)
    }
  })

  it('includes the requested basic providers', () => {
    const ids = PROVIDER_CATALOG.map((p) => p.id)
    expect(ids).toEqual(expect.arrayContaining(['deepseek', 'moonshot', 'copilot', 'mistral']))
  })
})

describe('createCustomProvider', () => {
  it('builds a web-only provider with a unique id', () => {
    const a = createCustomProvider('Linear', 'https://linear.app')
    const b = createCustomProvider('Linear', 'https://linear.app')

    expect(a.id).not.toBe(b.id)
    expect(a.modes).toEqual(['web'])
    expect(a.name).toBe('Linear')
    expect(a.url).toBe('https://linear.app')
  })
})
