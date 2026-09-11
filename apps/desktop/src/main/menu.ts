import { app, dialog, Menu, type BrowserWindow, type MenuItemConstructorOptions } from 'electron'
import { PROVIDER_CATALOG } from '@shared/providers'
import { MENU_CHANNELS } from '@shared/ipc'

const isMac = process.platform === 'darwin'

// Menu items never reach into a provider's session or page directly (see
// docs/specs/00-agent-rules.md) — they only tell the renderer what happened
// and the renderer decides what to do with it, same as any other user action.
interface MenuCallbacks {
  onOpenSettings: () => void
}

export function buildApplicationMenu(mainWindow: BrowserWindow, { onOpenSettings }: MenuCallbacks): Menu {
  const send = (channel: string, ...args: unknown[]): void => {
    mainWindow.webContents.send(channel, ...args)
  }

  const webProviderItems: MenuItemConstructorOptions[] = PROVIDER_CATALOG.filter((provider) =>
    provider.modes.includes('web')
  ).map((provider) => ({
    label: provider.name,
    click: () => send(MENU_CHANNELS.newWebSession, provider.id)
  }))

  // macOS gets Preferences in the app menu (below); other platforms get it in File.
  const fileMenuSettingsItems: MenuItemConstructorOptions[] = isMac
    ? []
    : [
        { label: 'Settings…', accelerator: 'Ctrl+,', click: () => onOpenSettings() },
        { type: 'separator' }
      ]

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? ([
          {
            label: 'AI Workspace',
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { label: 'Preferences…', accelerator: 'Cmd+,', click: () => onOpenSettings() },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ] satisfies MenuItemConstructorOptions[])
      : []),
    {
      label: 'File',
      submenu: [
        { label: 'New Web Session', submenu: webProviderItems },
        { label: 'New Terminal Session', click: () => send(MENU_CHANNELS.newTerminalSession) },
        { type: 'separator' },
        ...fileMenuSettingsItems,
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Theme', accelerator: 'CmdOrCtrl+J', click: () => send(MENU_CHANNELS.toggleTheme) },
        { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+B', click: () => send(MENU_CHANNELS.toggleSidebar) },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [{ role: 'front' } as const] : [{ role: 'close' } as const])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About AI Workspace',
          click: () => {
            void dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About AI Workspace',
              message: 'AI Workspace',
              detail: `Version ${app.getVersion()}\n\nA desktop workspace for isolated AI provider sessions, unified API chat, and terminals.`
            })
          }
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}
