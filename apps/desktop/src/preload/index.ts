import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  SETTINGS_CHANNELS,
  TERMINAL_CHANNELS,
  WEB_SESSION_CHANNELS,
  type MenuChannel,
  type OpenWebSessionRequest,
  type TerminalDataMessage,
  type TerminalInputMessage,
  type TerminalResizeMessage,
  type WebSessionBounds
} from '@shared/ipc'
import type { AppSettings } from '@shared/settings'

// This is the ONLY bridge between the untrusted renderer and Node/Electron —
// see docs/specs/06-security.md. Never widen this to a generic
// ipcRenderer passthrough.
const api = {
  onMenuAction: (channel: MenuChannel, callback: (...args: unknown[]) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, ...args: unknown[]): void => callback(...args)
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
  },
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(SETTINGS_CHANNELS.get),
  saveSettings: (settings: AppSettings): Promise<void> => ipcRenderer.invoke(SETTINGS_CHANNELS.set, settings),
  openSettingsWindow: (): void => ipcRenderer.send(SETTINGS_CHANNELS.openWindow),
  openWebSession: (request: OpenWebSessionRequest): void => ipcRenderer.send(WEB_SESSION_CHANNELS.open, request),
  closeWebSession: (sessionId: string): void => ipcRenderer.send(WEB_SESSION_CHANNELS.close, sessionId),
  activateWebSession: (sessionId: string | null): void =>
    ipcRenderer.send(WEB_SESSION_CHANNELS.activate, sessionId),
  setWebSessionBounds: (bounds: WebSessionBounds): void =>
    ipcRenderer.send(WEB_SESSION_CHANNELS.setBounds, bounds),
  openTerminal: (sessionId: string): void => ipcRenderer.send(TERMINAL_CHANNELS.open, sessionId),
  sendTerminalInput: (sessionId: string, data: string): void =>
    ipcRenderer.send(TERMINAL_CHANNELS.input, { sessionId, data } satisfies TerminalInputMessage),
  resizeTerminal: (sessionId: string, cols: number, rows: number): void =>
    ipcRenderer.send(TERMINAL_CHANNELS.resize, { sessionId, cols, rows } satisfies TerminalResizeMessage),
  closeTerminal: (sessionId: string): void => ipcRenderer.send(TERMINAL_CHANNELS.close, sessionId),
  onTerminalData: (callback: (message: TerminalDataMessage) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, message: TerminalDataMessage): void => callback(message)
    ipcRenderer.on(TERMINAL_CHANNELS.data, listener)
    return () => ipcRenderer.removeListener(TERMINAL_CHANNELS.data, listener)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // contextIsolation is always on in production; this path only matters if it's
  // ever disabled for local debugging, so a type cast is fine here.
  const globalWindow = window as unknown as { electron: typeof electronAPI; api: typeof api }
  globalWindow.electron = electronAPI
  globalWindow.api = api
}

export type Api = typeof api
