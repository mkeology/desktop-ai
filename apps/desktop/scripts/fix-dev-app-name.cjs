// In dev (`npm run dev`), the running binary is the generic Electron.app
// that ships inside node_modules/electron — its Info.plist hardcodes
// CFBundleName/CFBundleDisplayName to "Electron", so the macOS Dock, the
// app (menu bar) menu, and Cmd+Tab all show "Electron" instead of "AI
// Workspace" no matter what app.setName() is called with at runtime (macOS
// reads those labels from the bundle on disk, not from the running
// process). Packaged builds don't have this problem — electron-builder
// renames the whole bundle via `productName` — so this only patches the
// local dev copy, and only cosmetic name fields; the executable name and
// bundle identifier are left alone so Electron still launches normally.
//
// Runs from apps/desktop's postinstall. Safe to run repeatedly (idempotent)
// and never fails the install if anything's missing or this isn't macOS.
const { execFileSync } = require('node:child_process')
const path = require('node:path')

const APP_NAME = 'AI Workspace'

function main() {
  if (process.platform !== 'darwin') return

  let electronPkgPath
  try {
    electronPkgPath = require.resolve('electron/package.json')
  } catch {
    return
  }

  const plistPath = path.join(path.dirname(electronPkgPath), 'dist', 'Electron.app', 'Contents', 'Info.plist')

  for (const key of ['CFBundleName', 'CFBundleDisplayName']) {
    try {
      execFileSync('/usr/bin/plutil', ['-replace', key, '-string', APP_NAME, plistPath], { stdio: 'ignore' })
    } catch {
      // Missing plist (electron not installed yet) or read-only fs — not fatal.
      return
    }
  }
}

main()
