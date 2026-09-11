import { homedir } from 'node:os'
import { spawn, type IPty } from 'node-pty'
import type { BrowserWindow } from 'electron'
import { TERMINAL_CHANNELS, type TerminalDataMessage } from '@shared/ipc'

// Scrollback kept per session so switching away and back doesn't hand the
// user a blank terminal — the shell process itself never stops running in
// the background (see docs/specs/04-architecture.md), only the renderer's
// xterm.js view unmounts. Capped so a chatty long-running command can't
// grow this unbounded.
const HISTORY_LIMIT_BYTES = 200_000

interface TerminalEntry {
  pty: IPty
  history: string
}

const terminals = new Map<string, TerminalEntry>()
let ownerWindow: BrowserWindow | null = null

export function attachToWindow(window: BrowserWindow): void {
  ownerWindow = window
}

// Called when the owning window closes — every shell it hosted goes with it.
export function resetTerminalSessions(): void {
  for (const entry of terminals.values()) entry.pty.kill()
  terminals.clear()
  ownerWindow = null
}

function defaultShell(): string {
  if (process.platform === 'win32') return process.env['COMSPEC'] || 'powershell.exe'
  return process.env['SHELL'] || '/bin/zsh'
}

export function openTerminalSession(sessionId: string): void {
  const existing = terminals.get(sessionId)
  if (existing) {
    // Already running — replay the buffered scrollback into the (possibly
    // freshly mounted) view, then live streaming just continues as normal.
    if (existing.history) {
      ownerWindow?.webContents.send(TERMINAL_CHANNELS.data, {
        sessionId,
        data: existing.history
      } satisfies TerminalDataMessage)
    }
    return
  }

  const ptyProcess = spawn(defaultShell(), [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: homedir(),
    env: process.env as Record<string, string>
  })

  const entry: TerminalEntry = { pty: ptyProcess, history: '' }
  terminals.set(sessionId, entry)

  ptyProcess.onData((data) => {
    entry.history = (entry.history + data).slice(-HISTORY_LIMIT_BYTES)
    ownerWindow?.webContents.send(TERMINAL_CHANNELS.data, { sessionId, data } satisfies TerminalDataMessage)
  })

  ptyProcess.onExit(() => {
    terminals.delete(sessionId)
  })
}

export function writeToTerminal(sessionId: string, data: string): void {
  terminals.get(sessionId)?.pty.write(data)
}

export function resizeTerminal(sessionId: string, cols: number, rows: number): void {
  if (cols <= 0 || rows <= 0) return
  terminals.get(sessionId)?.pty.resize(cols, rows)
}

export function closeTerminalSession(sessionId: string): void {
  const entry = terminals.get(sessionId)
  if (!entry) return
  entry.pty.kill()
  terminals.delete(sessionId)
}
