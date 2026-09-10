import { useDismissablePopover } from '../hooks/useDismissablePopover'
import { useWorkspaceStore } from '../state/useWorkspaceStore'
import { ChevronDownIcon } from './ChevronDownIcon'

// Matches the git remote this repo is actually published to — never a
// guessed URL. Update if the repo moves.
const REPO_URL = 'https://github.com/mkeology/desktop-ai'

export function SidebarBottomMenu() {
  const { open, toggle, ref } = useDismissablePopover<HTMLDivElement>()
  const resolvedTheme = useWorkspaceStore((s) => s.resolvedTheme())
  const toggleTheme = useWorkspaceStore((s) => s.toggleTheme)

  return (
    <div ref={ref} className="relative border-t border-base-300 p-2">
      {open && (
        <div className="absolute bottom-full left-2 right-2 z-20 mb-2 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-block justify-start gap-2"
            onClick={() => window.api.openSettingsWindow()}
          >
            <span aria-hidden="true">⚙️</span> Settings
          </button>

          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">Theme</span>
            <button
              type="button"
              role="switch"
              aria-checked={resolvedTheme === 'dark'}
              className="btn btn-ghost btn-xs"
              onClick={() => toggleTheme()}
              title="Toggle light/dark theme (Cmd/Ctrl+J)"
            >
              {resolvedTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>

          <div className="divider my-1" />

          <div className="px-3 pb-1 text-xs text-base-content/50">
            <p>Version {__APP_VERSION__}</p>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="link">
              GitHub
            </a>
            <p>© {new Date().getFullYear()} AI Workspace</p>
          </div>
        </div>
      )}

      <button
        type="button"
        className="btn btn-ghost btn-sm btn-block justify-start gap-2"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span aria-hidden="true">⚙️</span>
        <span className="flex-1 text-left">Menu</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
}
