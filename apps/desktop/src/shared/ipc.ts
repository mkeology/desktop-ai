// Channel names for main -> renderer menu actions. Keep this the single
// source of truth for both sides of the IPC boundary (see
// docs/specs/05-developer-guide.md#ipc-conventions).

export const MENU_CHANNELS = {
  newWebSession: 'menu:new-web-session',
  // API Sessions is temporarily off the menu (see Sidebar.tsx) — no
  // newApiSession channel while there's nothing to send it to.
  newTerminalSession: 'menu:new-terminal-session',
  toggleTheme: 'menu:toggle-theme',
  toggleSidebar: 'menu:toggle-sidebar'
} as const

export type MenuChannel = (typeof MENU_CHANNELS)[keyof typeof MENU_CHANNELS]

// Request/response channels (ipcRenderer.invoke / ipcMain.handle) plus one
// fire-and-forget channel to ask main to open the settings window.
export const SETTINGS_CHANNELS = {
  get: 'settings:get',
  set: 'settings:set',
  openWindow: 'settings:open-window'
} as const

// Fire-and-forget renderer -> main channels driving the isolated
// WebContentsView per web session — see docs/specs/04-architecture.md.
export const WEB_SESSION_CHANNELS = {
  open: 'web-session:open',
  close: 'web-session:close',
  activate: 'web-session:activate',
  setBounds: 'web-session:set-bounds'
} as const

export interface OpenWebSessionRequest {
  sessionId: string
  providerId: string
  accountId: string
  url: string
}

export interface WebSessionBounds {
  x: number
  y: number
  width: number
  height: number
}

// Fire-and-forget renderer <-> main channels for a real local shell
// (node-pty in main, xterm.js in the renderer) — see
// docs/specs/04-architecture.md.
export const TERMINAL_CHANNELS = {
  open: 'terminal:open',
  input: 'terminal:input',
  resize: 'terminal:resize',
  close: 'terminal:close',
  data: 'terminal:data'
} as const

export interface TerminalInputMessage {
  sessionId: string
  data: string
}

export interface TerminalResizeMessage {
  sessionId: string
  cols: number
  rows: number
}

export interface TerminalDataMessage {
  sessionId: string
  data: string
}
