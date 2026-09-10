import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('electron', () => ({
  app: { getPath: () => '/tmp/ai-workspace-test' },
  session: { defaultSession: { setProxy: vi.fn() } }
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn()
}))

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { session } from 'electron'
import { DEFAULT_SETTINGS } from '@shared/settings'
import { loadSettings, saveSettings } from '../settings'

describe('settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns defaults when no settings file exists', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('merges a partial settings file over the defaults', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ proxy: { http: 'http://proxy:8080' } }))

    const settings = loadSettings()

    expect(settings.proxy.http).toBe('http://proxy:8080')
    expect(settings.proxy.https).toBe('')
  })

  it('falls back to defaults if the settings file is corrupt', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('not json')

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('writes the file and applies proxy rules when saving', () => {
    saveSettings({ proxy: { http: 'http://p:8080', https: 'http://p:8443', noProxy: 'localhost' } })

    expect(writeFileSync).toHaveBeenCalled()
    expect(session.defaultSession.setProxy).toHaveBeenCalledWith({
      proxyRules: 'http=http://p:8080;https=http://p:8443',
      proxyBypassRules: 'localhost'
    })
  })

  it('omits empty proxy fields from the computed rules', () => {
    saveSettings({ proxy: { http: '', https: '', noProxy: '' } })

    expect(session.defaultSession.setProxy).toHaveBeenCalledWith({
      proxyRules: undefined,
      proxyBypassRules: undefined
    })
  })
})
