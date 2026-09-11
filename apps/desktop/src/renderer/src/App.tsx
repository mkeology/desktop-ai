import { useEffect } from 'react'
import { MENU_CHANNELS } from '@shared/ipc'
import { PROVIDER_CATALOG } from '@shared/providers'
import { Sidebar } from './components/Sidebar'
import { ContentArea } from './components/ContentArea'
import { useWorkspaceStore } from './state/useWorkspaceStore'

const DEFAULT_API_PROVIDER_ID = PROVIDER_CATALOG.find((p) => p.modes.includes('api'))?.id ?? 'chatgpt'

function App() {
  const resolvedTheme = useWorkspaceStore((s) => s.resolvedTheme())
  const toggleTheme = useWorkspaceStore((s) => s.toggleTheme)
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar)
  const openWebSession = useWorkspaceStore((s) => s.openWebSession)
  const openApiSession = useWorkspaceStore((s) => s.openApiSession)
  const openTerminalSession = useWorkspaceStore((s) => s.openTerminalSession)

  // DaisyUI reads the theme from data-theme on <html> — see index.css.
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
  }, [resolvedTheme])

  // The native application menu (src/main/menu.ts) drives the UI purely
  // through these events, same as any other user action would. The menu's
  // "New API Session" item isn't per-provider, so it opens/focuses a
  // sensible default rather than asking which one.
  useEffect(() => {
    const unsubscribers = [
      window.api.onMenuAction(MENU_CHANNELS.toggleTheme, () => toggleTheme()),
      window.api.onMenuAction(MENU_CHANNELS.toggleSidebar, () => toggleSidebar()),
      window.api.onMenuAction(MENU_CHANNELS.newWebSession, (providerId) =>
        openWebSession(providerId as string)
      ),
      window.api.onMenuAction(MENU_CHANNELS.newApiSession, () => openApiSession(DEFAULT_API_PROVIDER_ID)),
      window.api.onMenuAction(MENU_CHANNELS.newTerminalSession, () => openTerminalSession())
    ]
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [toggleTheme, toggleSidebar, openWebSession, openApiSession, openTerminalSession])

  // No separate tab strip — the sidebar itself shows which session is open
  // and active (see Sidebar.tsx), so there's nowhere else tabs need to
  // appear in the layout.
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-base-100 text-base-content">
      <Sidebar />
      <ContentArea />
    </div>
  )
}

export default App
