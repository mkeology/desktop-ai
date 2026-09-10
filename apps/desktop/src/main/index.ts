import { join } from 'node:path'
import { app, BrowserWindow, ipcMain, Menu, session, shell } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { SETTINGS_CHANNELS, WEB_SESSION_CHANNELS, type OpenWebSessionRequest, type WebSessionBounds } from '@shared/ipc'
import type { AppSettings } from '@shared/settings'
import { buildApplicationMenu } from './menu'
import { applyProxySettings, loadSettings, saveSettings } from './settings'
import { activateWebSession, attachToWindow, closeWebSession, openWebSession, resetWebSessions, setWebSessionBounds } from './webSessions'

const RENDERER_HTML = join(__dirname, '../renderer/index.html')
const PRELOAD_SCRIPT = join(__dirname, '../preload/index.js')

let mainWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null

function loadRenderer(window: BrowserWindow, view?: 'settings'): void {
  const query = view ? { view } : undefined
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const url = new URL(process.env['ELECTRON_RENDERER_URL'])
    if (view) url.searchParams.set('view', view)
    void window.loadURL(url.toString())
  } else {
    void window.loadFile(RENDERER_HTML, { query })
  }
}

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    show: false,
    webPreferences: {
      preload: PRELOAD_SCRIPT,
      // Non-negotiable per docs/specs/06-security.md — never loosen these.
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  window.on('ready-to-show', () => window.show())
  window.on('closed', () => {
    mainWindow = null
    resetWebSessions()
  })

  attachToWindow(window)

  // Anything that tries to open a new window (e.g. a link from a future
  // provider WebContentsView) goes to the OS browser, never a new
  // Electron window with any elevated access.
  window.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url)
    return { action: 'deny' }
  })

  Menu.setApplicationMenu(buildApplicationMenu(window, { onOpenSettings: createSettingsWindow }))

  loadRenderer(window)
  return window
}

// A second, small window sharing the same renderer bundle — see
// docs/specs/04-architecture.md#settings--configuration for why this isn't
// a separate app/entry point.
function createSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 480,
    height: 460,
    resizable: false,
    title: 'Settings',
    parent: mainWindow ?? undefined,
    show: false,
    webPreferences: {
      preload: PRELOAD_SCRIPT,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  settingsWindow.on('ready-to-show', () => settingsWindow?.show())
  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
  settingsWindow.setMenu(null)

  loadRenderer(settingsWindow, 'settings')
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.aiworkspace.desktop')

  app.on('browser-window-created', (_event, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Applied only in production builds — dev mode is served by the Vite dev
  // server, which injects its own inline HMR preamble script that a strict
  // script-src would break. See docs/specs/06-security.md.
  if (!is.dev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
          ]
        }
      })
    })
  }

  applyProxySettings(loadSettings())

  ipcMain.handle(SETTINGS_CHANNELS.get, () => loadSettings())
  ipcMain.handle(SETTINGS_CHANNELS.set, (_event, settings: AppSettings) => saveSettings(settings))
  ipcMain.on(SETTINGS_CHANNELS.openWindow, () => createSettingsWindow())

  ipcMain.on(WEB_SESSION_CHANNELS.open, (_event, request: OpenWebSessionRequest) => openWebSession(request))
  ipcMain.on(WEB_SESSION_CHANNELS.close, (_event, sessionId: string) => closeWebSession(sessionId))
  ipcMain.on(WEB_SESSION_CHANNELS.activate, (_event, sessionId: string | null) => activateWebSession(sessionId))
  ipcMain.on(WEB_SESSION_CHANNELS.setBounds, (_event, bounds: WebSessionBounds) => setWebSessionBounds(bounds))

  mainWindow = createMainWindow()

  if (!is.dev) {
    // Background check + silent download, per docs/specs/07-devops-release.md.
    // A custom non-blocking "update ready" UI can replace the default native
    // notification once the renderer has somewhere to show it.
    autoUpdater.checkForUpdatesAndNotify().catch(() => {
      // No published update feed yet (e.g. running an unpublished build) — safe to ignore.
    })
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
