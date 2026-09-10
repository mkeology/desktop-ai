import { useEffect } from 'react'
import { MENU_CHANNELS } from '@shared/ipc'
import { Sidebar } from './components/Sidebar'
import { TabBar } from './components/TabBar'
import { ContentArea } from './components/ContentArea'
import { useWorkspaceStore } from './state/useWorkspaceStore'

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
  // through these events, same as any other user action would.
  useEffect(() => {
    const unsubscribers = [
      window.api.onMenuAction(MENU_CHANNELS.toggleTheme, () => toggleTheme()),
      window.api.onMenuAction(MENU_CHANNELS.toggleSidebar, () => toggleSidebar()),
      window.api.onMenuAction(MENU_CHANNELS.newWebSession, (providerId) =>
        openWebSession(providerId as string)
      ),
      window.api.onMenuAction(MENU_CHANNELS.newApiSession, () => openApiSession()),
      window.api.onMenuAction(MENU_CHANNELS.newTerminalSession, () => openTerminalSession())
    ]
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [toggleTheme, toggleSidebar, openWebSession, openApiSession, openTerminalSession])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-base-100 text-base-content">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center border-b border-base-300 px-2">
          <TabBar />
        </div>
        <ContentArea />
      </div>
    </div>
  )
}

export default App
