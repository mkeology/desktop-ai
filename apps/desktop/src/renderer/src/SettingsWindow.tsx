import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, type AppSettings } from '@shared/settings'
import { useWorkspaceStore } from './state/useWorkspaceStore'

// Renders in its own BrowserWindow (see src/main/index.ts#createSettingsWindow),
// loaded from the same bundle as the main window — see
// docs/specs/04-architecture.md#settings--configuration.
export function SettingsWindow() {
  const resolvedTheme = useWorkspaceStore((s) => s.resolvedTheme())
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
  }, [resolvedTheme])

  useEffect(() => {
    window.api.getSettings().then(setSettings)
  }, [])

  function updateProxy(field: keyof AppSettings['proxy'], value: string): void {
    setSettings((prev) => ({ ...prev, proxy: { ...prev.proxy, [field]: value } }))
  }

  async function handleSave(): Promise<void> {
    setSaving(true)
    await window.api.saveSettings(settings)
    setSaving(false)
    window.close()
  }

  return (
    <div className="flex h-screen flex-col gap-4 bg-base-100 p-5 text-base-content">
      <h1 className="text-lg font-semibold">Settings</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Corporate Proxy
        </h2>

        <label className="flex flex-col gap-1">
          <span className="text-sm">HTTP proxy</span>
          <input
            type="text"
            placeholder="http://proxy.company.com:8080"
            className="input input-bordered input-sm w-full"
            value={settings.proxy.http}
            onChange={(event) => updateProxy('http', event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">HTTPS proxy</span>
          <input
            type="text"
            placeholder="http://proxy.company.com:8080"
            className="input input-bordered input-sm w-full"
            value={settings.proxy.https}
            onChange={(event) => updateProxy('https', event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">No proxy (bypass list)</span>
          <input
            type="text"
            placeholder="localhost,127.0.0.1,.company.com"
            className="input input-bordered input-sm w-full"
            value={settings.proxy.noProxy}
            onChange={(event) => updateProxy('noProxy', event.target.value)}
          />
        </label>

        <p className="text-xs text-base-content/50">
          Applies to web and API sessions. A proxy URL with embedded credentials is stored as
          plain text today — see docs/specs/06-security.md.
        </p>
      </section>

      <div className="mt-auto flex justify-end gap-2">
        <button type="button" className="btn btn-sm" onClick={() => window.close()}>
          Cancel
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleSave()} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
