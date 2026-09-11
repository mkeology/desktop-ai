import { useMemo, useState } from 'react'
import { PROVIDER_CATALOG, type Provider } from '@shared/providers'
import { useWorkspaceStore } from '../state/useWorkspaceStore'
import { AddProviderForm } from './AddProviderForm'
import { SidebarAccordion, type SidebarAccordionItem } from './SidebarAccordion'
import { SidebarBottomMenu } from './SidebarBottomMenu'

// One open tab per provider — the sidebar row itself doubles as that
// provider's tab: clicking it opens a session if none is open, or just
// focuses the existing one. See docs/specs/01-product-vision.md.
function buildWebItem(
  provider: Pick<Provider, 'id' | 'name' | 'url'>,
  openTabId: string | undefined,
  activeTabId: string | null,
  openWebSession: (id: string) => void,
  closeTab: (id: string) => void,
  removeCustomProvider?: (id: string) => void
): SidebarAccordionItem {
  return {
    key: `web-${provider.id}`,
    label: provider.name,
    sublabel: provider.url.replace(/^https?:\/\//, ''),
    onSelect: () => openWebSession(provider.id),
    isActive: !!openTabId && openTabId === activeTabId,
    trailingAction: openTabId
      ? { label: 'Close', onClick: () => closeTab(openTabId) }
      : removeCustomProvider
        ? { label: 'Remove', onClick: () => removeCustomProvider(provider.id) }
        : undefined
  }
}

// Collapse/expand shares the same store state the native "Toggle Sidebar"
// menu command (Cmd/Ctrl+B) uses — one source of truth for both controls.
export function Sidebar() {
  const sidebarOpen = useWorkspaceStore((s) => s.sidebarOpen)
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar)
  const tabs = useWorkspaceStore((s) => s.tabs)
  const activeTabId = useWorkspaceStore((s) => s.activeTabId)
  const openWebSession = useWorkspaceStore((s) => s.openWebSession)
  const openApiSession = useWorkspaceStore((s) => s.openApiSession)
  const openTerminalSession = useWorkspaceStore((s) => s.openTerminalSession)
  const closeTab = useWorkspaceStore((s) => s.closeTab)
  const customProviders = useWorkspaceStore((s) => s.customProviders)
  const removeCustomProvider = useWorkspaceStore((s) => s.removeCustomProvider)
  const [query, setQuery] = useState('')

  // Web sessions split by category, not lumped together — an AI provider
  // (Gemini) and a general web app (Gmail) aren't the same kind of thing,
  // even though both open as a "web" session. See docs/specs/01-product-vision.md.
  const aiProviderItems: SidebarAccordionItem[] = useMemo(
    () =>
      PROVIDER_CATALOG.filter((p) => p.modes.includes('web') && p.category === 'ai').map((p) => {
        const openTab = tabs.find((t) => t.type === 'web' && t.providerId === p.id)
        return buildWebItem(p, openTab?.id, activeTabId, openWebSession, closeTab)
      }),
    [tabs, activeTabId, openWebSession, closeTab]
  )

  // Built-in "productivity" web apps first, then anything the user has
  // added — the sidebar is extensible rather than a fixed list. Only
  // custom entries (and only while not open) get a "Remove from catalog"
  // control; an open one gets "Close" instead — never both.
  const webAppItems: SidebarAccordionItem[] = useMemo(() => {
    const builtIn = PROVIDER_CATALOG.filter((p) => p.modes.includes('web') && p.category === 'productivity').map(
      (p) => {
        const openTab = tabs.find((t) => t.type === 'web' && t.providerId === p.id)
        return buildWebItem(p, openTab?.id, activeTabId, openWebSession, closeTab)
      }
    )
    const custom = customProviders.map((p) => {
      const openTab = tabs.find((t) => t.type === 'web' && t.providerId === p.id)
      return buildWebItem(p, openTab?.id, activeTabId, openWebSession, closeTab, removeCustomProvider)
    })
    return [...builtIn, ...custom]
  }, [tabs, activeTabId, openWebSession, closeTab, customProviders, removeCustomProvider])

  const apiItems: SidebarAccordionItem[] = useMemo(
    () =>
      PROVIDER_CATALOG.filter((p) => p.modes.includes('api')).map((p) => {
        const openTab = tabs.find((t) => t.type === 'api' && t.provider === p.id)
        return {
          key: `api-${p.id}`,
          label: `${p.name} API`,
          onSelect: () => openApiSession(p.id),
          isActive: !!openTab && openTab.id === activeTabId,
          trailingAction: openTab ? { label: 'Close', onClick: () => closeTab(openTab.id) } : undefined
        }
      }),
    [tabs, activeTabId, openApiSession, closeTab]
  )

  const terminalItems: SidebarAccordionItem[] = useMemo(() => {
    const openTab = tabs.find((t) => t.type === 'terminal')
    return [
      {
        key: 'terminal-local',
        label: 'Local Shell',
        onSelect: () => openTerminalSession(),
        isActive: !!openTab && openTab.id === activeTabId,
        trailingAction: openTab ? { label: 'Close', onClick: () => closeTab(openTab.id) } : undefined
      }
    ]
  }, [tabs, activeTabId, openTerminalSession, closeTab])

  const matches = (items: SidebarAccordionItem[]): SidebarAccordionItem[] =>
    query.trim() === '' ? items : items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))

  const filteredAiProviders = matches(aiProviderItems)
  const filteredWebApps = matches(webAppItems)
  const filteredApi = matches(apiItems)
  const filteredTerminal = matches(terminalItems)
  const isSearching = query.trim() !== ''

  if (!sidebarOpen) {
    return (
      <aside className="flex w-12 shrink-0 flex-col items-center border-r border-base-300 bg-base-200 py-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => toggleSidebar()}
          aria-label="Expand sidebar"
          title="Expand sidebar (Cmd/Ctrl+B)"
        >
          »
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-base-300 bg-base-200">
      <div className="flex items-center justify-between px-2 py-2">
        <span className="truncate text-sm font-semibold">AI Workspace</span>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={() => toggleSidebar()}
          aria-label="Collapse sidebar"
          title="Collapse sidebar (Cmd/Ctrl+B)"
        >
          «
        </button>
      </div>

      <div className="px-2 pb-2">
        <input
          type="text"
          placeholder="Search all menus..."
          className="input input-sm input-bordered w-full"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <SidebarAccordion
          icon="🤖"
          label="AI Web Session"
          items={filteredAiProviders}
          defaultOpen
          forceOpen={isSearching && filteredAiProviders.length > 0}
        />
        <SidebarAccordion
          icon="🌐"
          label="Web Apps"
          items={filteredWebApps}
          forceOpen={isSearching && filteredWebApps.length > 0}
          footer={!isSearching && <AddProviderForm />}
        />
        <SidebarAccordion
          icon="⚡"
          label="API Sessions"
          items={filteredApi}
          forceOpen={isSearching && filteredApi.length > 0}
        />
        <SidebarAccordion
          icon="⌨️"
          label="Terminal"
          items={filteredTerminal}
          forceOpen={isSearching && filteredTerminal.length > 0}
        />
      </div>

      <SidebarBottomMenu />
    </aside>
  )
}
