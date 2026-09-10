// Providers are data, not code (docs/specs/05-developer-guide.md#adding-a-provider-to-the-catalog).
// This seed catalog will move into SQLite (docs/specs/04-architecture.md) once
// storage lands; for the skeleton it's a static list the UI reads directly.

export type ProviderCategory = 'ai' | 'productivity'
export type ProviderMode = 'web' | 'api'

export interface Provider {
  id: string
  name: string
  url: string
  category: ProviderCategory
  modes: ProviderMode[]
}

export const PROVIDER_CATALOG: Provider[] = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', category: 'ai', modes: ['web', 'api'] },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', category: 'ai', modes: ['web', 'api'] },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', category: 'ai', modes: ['web', 'api'] },
  { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai', category: 'ai', modes: ['web'] },
  { id: 'deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com', category: 'ai', modes: ['web', 'api'] },
  { id: 'moonshot', name: 'Moonshot (Kimi)', url: 'https://kimi.moonshot.cn', category: 'ai', modes: ['web', 'api'] },
  { id: 'copilot', name: 'GitHub Copilot', url: 'https://github.com/copilot', category: 'ai', modes: ['web'] },
  { id: 'mistral', name: 'Mistral (Le Chat)', url: 'https://chat.mistral.ai', category: 'ai', modes: ['web', 'api'] },
  { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', category: 'productivity', modes: ['web'] },
  { id: 'notion', name: 'Notion', url: 'https://notion.so', category: 'productivity', modes: ['web'] }
]

// User-added providers (arbitrary URL) get this shape — see
// docs/specs/03-user-guide.md#using-it and useWorkspaceStore.addCustomProvider.
// Kept web-only: there's no way to guess an API shape for an arbitrary site.
export function createCustomProvider(name: string, url: string): Provider {
  return {
    id: `custom-${crypto.randomUUID()}`,
    name,
    url,
    category: 'productivity',
    modes: ['web']
  }
}
