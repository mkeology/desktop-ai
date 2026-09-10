import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ApiSession, Session, TerminalSession, WebSession } from '@shared/session'
import { createCustomProvider, PROVIDER_CATALOG, type Provider } from '@shared/providers'

type ThemeChoice = 'light' | 'dark' | 'system'

interface WorkspaceState {
  theme: ThemeChoice
  sidebarOpen: boolean
  tabs: Session[]
  activeTabId: string | null
  customProviders: Provider[]
  resolvedTheme: () => 'light' | 'dark'
  toggleTheme: () => void
  toggleSidebar: () => void
  openWebSession: (providerId: string) => void
  openApiSession: () => void
  openTerminalSession: () => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  addCustomProvider: (input: { name: string; url: string }) => void
  removeCustomProvider: (id: string) => void
}

let sessionCounter = 0
function nextId(prefix: string): string {
  sessionCounter += 1
  return `${prefix}-${sessionCounter}`
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Every "open" action here creates a Session record — see
// docs/specs/04-architecture.md. Web sessions get a real, isolated
// WebContentsView (managed by ContentArea + src/main/webSessions.ts); API
// and terminal sessions still render as placeholders until later milestones.
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      sidebarOpen: true,
      tabs: [],
      activeTabId: null,
      customProviders: [],

      resolvedTheme: () => {
        const { theme } = get()
        if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light'
        return theme
      },

      toggleTheme: () =>
        set((state) => ({
          theme: state.resolvedTheme() === 'dark' ? 'light' : 'dark'
        })),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      openWebSession: (providerId) => {
        const provider = [...PROVIDER_CATALOG, ...get().customProviders].find((p) => p.id === providerId)
        if (!provider) return
        const newSession: WebSession = {
          id: nextId('web'),
          type: 'web',
          name: provider.name,
          workspaceId: 'default',
          providerId: provider.id,
          accountId: 'default',
          url: provider.url
        }
        set((state) => ({ tabs: [...state.tabs, newSession], activeTabId: newSession.id }))
      },

      openApiSession: () => {
        const newSession: ApiSession = {
          id: nextId('api'),
          type: 'api',
          name: 'API Chat',
          workspaceId: 'default',
          provider: 'openai',
          model: 'default'
        }
        set((state) => ({ tabs: [...state.tabs, newSession], activeTabId: newSession.id }))
      },

      openTerminalSession: () => {
        const newSession: TerminalSession = {
          id: nextId('terminal'),
          type: 'terminal',
          name: 'Terminal',
          workspaceId: 'default',
          shell: 'default',
          cwd: '~'
        }
        set((state) => ({ tabs: [...state.tabs, newSession], activeTabId: newSession.id }))
      },

      closeTab: (id) => {
        window.api.closeWebSession(id) // no-op in main if this wasn't a web session
        set((state) => {
          const tabs = state.tabs.filter((t) => t.id !== id)
          const activeTabId = state.activeTabId === id ? (tabs.at(-1)?.id ?? null) : state.activeTabId
          return { tabs, activeTabId }
        })
      },

      setActiveTab: (id) => set({ activeTabId: id }),

      addCustomProvider: ({ name, url }) =>
        set((state) => ({ customProviders: [...state.customProviders, createCustomProvider(name, url)] })),

      removeCustomProvider: (id) =>
        set((state) => ({ customProviders: state.customProviders.filter((p) => p.id !== id) }))
    }),
    {
      name: 'ai-workspace-store',
      partialize: (state) => ({ theme: state.theme, customProviders: state.customProviders })
    }
  )
)
