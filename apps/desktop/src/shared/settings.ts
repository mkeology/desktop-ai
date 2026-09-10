// Persisted app settings — see docs/specs/04-architecture.md#settings--configuration.
// Kept intentionally small: corporate proxy config is the only setting that
// has to live in the main process (it drives Electron's session proxy).

export interface ProxySettings {
  http: string
  https: string
  noProxy: string
}

export interface AppSettings {
  proxy: ProxySettings
}

export const DEFAULT_SETTINGS: AppSettings = {
  proxy: { http: '', https: '', noProxy: '' }
}
