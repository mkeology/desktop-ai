import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { app, session } from 'electron'
import { DEFAULT_SETTINGS, type AppSettings } from '@shared/settings'

function settingsFilePath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export function loadSettings(): AppSettings {
  const filePath = settingsFilePath()
  if (!existsSync(filePath)) return DEFAULT_SETTINGS
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'))
    return { ...DEFAULT_SETTINGS, ...parsed, proxy: { ...DEFAULT_SETTINGS.proxy, ...parsed.proxy } }
  } catch {
    // Corrupt or unreadable settings file — fall back rather than crash the app.
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  writeFileSync(settingsFilePath(), JSON.stringify(settings, null, 2), 'utf-8')
  applyProxySettings(settings)
}

// A proxy URL embedding credentials (http://user:pass@host) is effectively a
// secret — see docs/specs/06-security.md. This is a known gap: today it's
// stored in plain JSON like the rest of the setting, not in the OS keychain.
export function applyProxySettings(settings: AppSettings): void {
  const { http, https, noProxy } = settings.proxy
  const proxyRules = [http && `http=${http}`, https && `https=${https}`].filter(Boolean).join(';')

  void session.defaultSession.setProxy({
    proxyRules: proxyRules || undefined,
    proxyBypassRules: noProxy || undefined
  })
}
