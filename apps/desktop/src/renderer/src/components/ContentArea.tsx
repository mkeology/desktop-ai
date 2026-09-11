import { useEffect, useRef } from 'react'
import type { ApiSession } from '@shared/session'
import { useWorkspaceStore } from '../state/useWorkspaceStore'
import { TerminalView } from './TerminalView'

function describeSession(session: ApiSession): string {
  return `Unified API chat session (provider: ${session.provider}). The chat UI lands here in Phase 3 — see docs/specs/01-product-vision.md.`
}

export function ContentArea() {
  const tabs = useWorkspaceStore((s) => s.tabs)
  const activeTabId = useWorkspaceStore((s) => s.activeTabId)
  const activeTab = tabs.find((t) => t.id === activeTabId)
  const containerRef = useRef<HTMLDivElement>(null)

  // A web session's real content is a native WebContentsView the main
  // process layers on top of this window at these coordinates — see
  // docs/specs/04-architecture.md#the-session-abstraction. This container
  // exists to reserve and report that screen region; it never renders the
  // page itself.
  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    function reportBounds(): void {
      if (!element) return
      const rect = element.getBoundingClientRect()
      window.api.setWebSessionBounds({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      })
    }

    reportBounds()
    const observer = new ResizeObserver(reportBounds)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Opening is idempotent in main (a second open on an already-open session
  // is a no-op), so it's safe to call every time this tab becomes active.
  useEffect(() => {
    if (activeTab?.type === 'web') {
      window.api.openWebSession({
        sessionId: activeTab.id,
        providerId: activeTab.providerId,
        accountId: activeTab.accountId,
        url: activeTab.url
      })
      window.api.activateWebSession(activeTab.id)
    } else {
      window.api.activateWebSession(null)
    }
  }, [activeTab])

  return (
    <div ref={containerRef} className="relative flex-1">
      {!activeTab && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-base-content/60">
          <p className="text-lg font-medium">No session open</p>
          <p className="text-sm">Pick a provider, API chat, or terminal from the sidebar to get started.</p>
        </div>
      )}
      {activeTab?.type === 'terminal' && (
        <div className="absolute inset-0">
          <TerminalView sessionId={activeTab.id} />
        </div>
      )}
      {activeTab?.type === 'api' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <h2 className="text-xl font-semibold">{activeTab.name}</h2>
          <p className="max-w-md text-sm text-base-content/70">{describeSession(activeTab)}</p>
        </div>
      )}
    </div>
  )
}
