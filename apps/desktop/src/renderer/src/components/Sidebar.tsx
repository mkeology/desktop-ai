import { useMemo, useState } from 'react'
import { PROVIDER_CATALOG, type Provider } from '@shared/providers'
import { useWorkspaceStore } from '../state/useWorkspaceStore'
import { AddProviderForm } from './AddProviderForm'
import { SidebarAccordion, type SidebarAccordionItem } from './SidebarAccordion'
import { SidebarBottomMenu } from './SidebarBottomMenu'

function providerToItem(
  provider: Pick<Provider, 'id' | 'name' | 'url'>,
  onSelect: (id: string) => void,
  onRemove?: (id: string) => void
): SidebarAccordionItem {
  return {
    key: `web-${provider.id}`,
    label: provider.name,
    sublabel: provider.url.replace(/^https?:\/\//, ''),
    onSelect: () => onSelect(provider.id),
    ...(onRemove ? { onRemove: () => onRemove(provider.id) } : {})
  }
}

// Collapse/expand shares the same store state the native "Toggle Sidebar"
// menu command (Cmd/Ctrl+B) uses — one source of truth for both controls.
export function Sidebar() {
  const sidebarOpen = useWorkspaceStore((s) => s.sidebarOpen)
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar)
  const openWebSession = useWorkspaceStore((s) => s.openWebSession)
  const openApiSession = useWorkspaceStore((s) => s.openApiSession)
  const openTerminalSession = useWorkspaceStore((s) => s.openTerminalSession)
  const customProviders = useWorkspaceStore((s) => s.customProviders)
  const removeCustomProvider = useWorkspaceStore((s) => s.removeCustomProvider)
  const [query, setQuery] = useState('')

  // Web sessions split by category, not lumped together — an AI provider
  // (Gemini) and a general web app (Gmail) aren't the same kind of thing,
  // even though both open as a "web" session. See docs/specs/01-product-vision.md.
  const aiProviderItems: SidebarAccordionItem[] = useMemo(
    () =>
      PROVIDER_CATALOG.filter((p) => p.modes.includes('web') && p.category === 'ai').map((p) =>
        providerToItem(p, openWebSession)
      ),
    [openWebSession]
  )

  // Built-in "productivity" web apps first, then anything the user has
  // added — the sidebar is extensible rather than a fixed list. Only
  // custom entries get a remove control.
  const webAppItems: SidebarAccordionItem[] = useMemo(
    () => [
      ...PROVIDER_CATALOG.filter((p) => p.modes.includes('web') && p.category === 'productivity').map((p) =>
        providerToItem(p, openWebSession)
      ),
      ...customProviders.map((p) => providerToItem(p, openWebSession, removeCustomProvider))
    ],
    [openWebSession, customProviders, removeCustomProvider]
  )

  const apiItems: SidebarAccordionItem[] = useMemo(
    () =>
      PROVIDER_CATALOG.filter((p) => p.modes.includes('api')).map((p) => ({
        key: `api-${p.id}`,
        label: `${p.name} API`,
        onSelect: () => openApiSession()
      })),
    [openApiSession]
  )

  const terminalItems: SidebarAccordionItem[] = useMemo(
    () => [{ key: 'terminal-local', label: 'Local Shell', onSelect: () => openTerminalSession() }],
    [openTerminalSession]
  )

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
