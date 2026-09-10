import { shell, WebContentsView, type BrowserWindow, type Rectangle } from 'electron'
import type { OpenWebSessionRequest, WebSessionBounds } from '@shared/ipc'

const ZERO_BOUNDS: Rectangle = { x: 0, y: 0, width: 0, height: 0 }

const views = new Map<string, WebContentsView>()
let ownerWindow: BrowserWindow | null = null
let activeSessionId: string | null = null
let lastBounds: Rectangle = ZERO_BOUNDS

// One partition per (provider, account) — never shared, never reused across
// a different account. This is the actual account-isolation mechanism from
// docs/specs/00-agent-rules.md and docs/specs/06-security.md.
function partitionFor(providerId: string, accountId: string): string {
  return `persist:${providerId}-${accountId}`
}

export function attachToWindow(window: BrowserWindow): void {
  ownerWindow = window
}

// Called when the owning window closes — every WebContentsView it hosted
// closes with it, so drop our references rather than leak/reuse stale ones.
export function resetWebSessions(): void {
  views.clear()
  ownerWindow = null
  activeSessionId = null
  lastBounds = ZERO_BOUNDS
}

export function openWebSession(request: OpenWebSessionRequest): void {
  if (!ownerWindow || views.has(request.sessionId)) return

  const view = new WebContentsView({
    webPreferences: {
      partition: partitionFor(request.providerId, request.accountId),
      // Same non-negotiable hardening as every window — see docs/specs/06-security.md.
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
      // Deliberately no preload: provider pages are never scripted or
      // manipulated, per docs/specs/00-agent-rules.md.
    }
  })

  view.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url)
    return { action: 'deny' }
  })

  ownerWindow.contentView.addChildView(view)
  view.setBounds(ZERO_BOUNDS) // hidden until activated
  void view.webContents.loadURL(request.url)

  views.set(request.sessionId, view)
}

export function closeWebSession(sessionId: string): void {
  const view = views.get(sessionId)
  if (!view) return

  ownerWindow?.contentView.removeChildView(view)
  view.webContents.close()
  views.delete(sessionId)
  if (activeSessionId === sessionId) activeSessionId = null
}

// Only one session is ever visible at a time today (no split-screen yet) —
// giving every inactive view zero-size bounds keeps them alive (so their
// login state and scroll position survive) without them being on-screen.
export function activateWebSession(sessionId: string | null): void {
  activeSessionId = sessionId
  applyBounds()
}

export function setWebSessionBounds(bounds: WebSessionBounds): void {
  lastBounds = bounds
  applyBounds()
}

function applyBounds(): void {
  for (const [id, view] of views) {
    view.setBounds(id === activeSessionId ? lastBounds : ZERO_BOUNDS)
  }
}
