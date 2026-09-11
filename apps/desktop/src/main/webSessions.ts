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

  // Not attached to the window yet — only the active session's view is
  // ever attached (see activateWebSession). It still loads and keeps
  // running in the background so switching back to it doesn't reload it.
  void view.webContents.loadURL(request.url)
  views.set(request.sessionId, view)
}

export function closeWebSession(sessionId: string): void {
  const view = views.get(sessionId)
  if (!view) return

  if (activeSessionId === sessionId) {
    ownerWindow?.contentView.removeChildView(view)
    activeSessionId = null
  }
  view.webContents.close()
  views.delete(sessionId)
}

// Only one session is ever visible at a time today (no split-screen yet).
// The inactive-but-open sessions are deliberately *detached* from the
// window's contentView rather than just resized to zero — toggling
// visibility via setBounds(0,0,0,0) is a known-flaky pattern in Electron's
// WebContentsView: the page keeps rendering correctly underneath (verified
// via CDP), but the compositor doesn't reliably repaint it once it's given
// real bounds again, especially with several views cycling through this.
// Fully removing/re-adding the view from the tree avoids that class of bug.
export function activateWebSession(sessionId: string | null): void {
  if (!ownerWindow) return

  if (activeSessionId && activeSessionId !== sessionId) {
    const previous = views.get(activeSessionId)
    if (previous) ownerWindow.contentView.removeChildView(previous)
  }

  activeSessionId = sessionId

  if (sessionId) {
    const view = views.get(sessionId)
    if (view) {
      ownerWindow.contentView.addChildView(view)
      view.setBounds(lastBounds)
    }
  }
}

export function setWebSessionBounds(bounds: WebSessionBounds): void {
  lastBounds = bounds
  if (!activeSessionId) return
  const view = views.get(activeSessionId)
  if (view) view.setBounds(lastBounds)
}
