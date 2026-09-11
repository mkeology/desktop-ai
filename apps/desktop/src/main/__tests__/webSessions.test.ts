import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('electron', () => {
  class FakeWebContentsView {
    webContents = {
      setWindowOpenHandler: vi.fn(),
      loadURL: vi.fn(),
      close: vi.fn()
    }
    setBounds = vi.fn()
  }
  return {
    shell: { openExternal: vi.fn() },
    WebContentsView: FakeWebContentsView
  }
})

import {
  activateWebSession,
  attachToWindow,
  closeWebSession,
  openWebSession,
  resetWebSessions,
  setWebSessionBounds
} from '../webSessions'

function createFakeWindow(): { contentView: { addChildView: ReturnType<typeof vi.fn>; removeChildView: ReturnType<typeof vi.fn> } } {
  return {
    contentView: {
      addChildView: vi.fn(),
      removeChildView: vi.fn()
    }
  }
}

const REQUEST_A = { sessionId: 'a', providerId: 'chatgpt', accountId: 'default', url: 'https://chatgpt.com' }
const REQUEST_B = { sessionId: 'b', providerId: 'claude', accountId: 'default', url: 'https://claude.ai' }

describe('webSessions', () => {
  let window: ReturnType<typeof createFakeWindow>

  beforeEach(() => {
    resetWebSessions()
    window = createFakeWindow()
    attachToWindow(window as never)
  })

  // Regression test for the "window goes blank after several tabs" bug —
  // see docs/specs/04-architecture.md#sequence-opening-an-isolated-web-session.
  // Visibility must be attach/detach, never a zero-size setBounds "hide".

  it('does not attach a session to the window until it is activated', () => {
    openWebSession(REQUEST_A)
    expect(window.contentView.addChildView).not.toHaveBeenCalled()
  })

  it('attaches and sizes the session on activation', () => {
    openWebSession(REQUEST_A)
    setWebSessionBounds({ x: 0, y: 0, width: 800, height: 600 })
    activateWebSession('a')
    expect(window.contentView.addChildView).toHaveBeenCalledTimes(1)
  })

  it('detaches the previous session when switching to another, never leaving both attached', () => {
    openWebSession(REQUEST_A)
    openWebSession(REQUEST_B)
    activateWebSession('a')
    activateWebSession('b')
    expect(window.contentView.removeChildView).toHaveBeenCalledTimes(1)
    expect(window.contentView.addChildView).toHaveBeenCalledTimes(2)
  })

  it('re-attaches a session when switching back to it', () => {
    openWebSession(REQUEST_A)
    openWebSession(REQUEST_B)
    activateWebSession('a')
    activateWebSession('b')
    activateWebSession('a')
    expect(window.contentView.addChildView).toHaveBeenCalledTimes(3)
    expect(window.contentView.removeChildView).toHaveBeenCalledTimes(2)
  })

  it('closing the active session detaches it', () => {
    openWebSession(REQUEST_A)
    activateWebSession('a')
    closeWebSession('a')
    expect(window.contentView.removeChildView).toHaveBeenCalledTimes(1)
  })

  it('closing an inactive session does not attempt to detach it (it was never attached)', () => {
    openWebSession(REQUEST_A)
    openWebSession(REQUEST_B)
    activateWebSession('a')
    closeWebSession('b')
    expect(window.contentView.removeChildView).not.toHaveBeenCalled()
  })

  it('opening the same session id twice is a no-op the second time', () => {
    openWebSession(REQUEST_A)
    openWebSession(REQUEST_A)
    activateWebSession('a')
    expect(window.contentView.addChildView).toHaveBeenCalledTimes(1)
  })
})
