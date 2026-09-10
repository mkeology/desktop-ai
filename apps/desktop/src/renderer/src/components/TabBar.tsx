import type { SessionType } from '@shared/session'
import { useWorkspaceStore } from '../state/useWorkspaceStore'

const TYPE_BADGE: Record<SessionType, string> = {
  web: 'badge-primary',
  api: 'badge-secondary',
  terminal: 'badge-accent'
}

export function TabBar() {
  const tabs = useWorkspaceStore((s) => s.tabs)
  const activeTabId = useWorkspaceStore((s) => s.activeTabId)
  const setActiveTab = useWorkspaceStore((s) => s.setActiveTab)
  const closeTab = useWorkspaceStore((s) => s.closeTab)

  if (tabs.length === 0) {
    return <div className="px-3 py-2 text-sm text-base-content/50">No sessions open</div>
  }

  return (
    <div role="tablist" className="tabs tabs-lift flex-1 flex-nowrap overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeTabId}
          className={`tab gap-2 whitespace-nowrap ${tab.id === activeTabId ? 'tab-active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className={`badge badge-xs ${TYPE_BADGE[tab.type]}`} aria-hidden="true" />
          {tab.name}
          <span
            role="button"
            tabIndex={0}
            aria-label={`Close ${tab.name}`}
            className="ml-1 opacity-60 hover:opacity-100"
            onClick={(event) => {
              event.stopPropagation()
              closeTab(tab.id)
            }}
          >
            ✕
          </span>
        </button>
      ))}
    </div>
  )
}
