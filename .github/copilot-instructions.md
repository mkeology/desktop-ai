# GitHub Copilot Instructions

This repository contains two separate apps, not one shared codebase:

- **Web app** (`apps/web`) — a marketing **landing page** for the product. Plain website, no Electron, no product logic — its job is to explain/sell the desktop app.
- **Desktop app** (`apps/desktop`) — **the actual product**, built with **Electron + Node.js**, packaged for Windows, macOS, and Linux.

Product specs live in [`docs/specs/`](../docs/specs/README.md) — read `docs/specs/00-agent-rules.md` before implementing product behavior; it defines the Session/Workspace model and account-isolation rules. Don't invent product features or marketing copy beyond what's specified there; ask if a task needs a decision that isn't covered.

## Stack

- Desktop shell: Electron (latest stable), Node.js current LTS.
- Styling: Tailwind CSS + DaisyUI in both apps (shared theme config), with working dark and light themes.
- CI/CD: GitHub Actions — CI on every PR, desktop release build on tag push (`v*.*.*`), packaged with electron-builder for Windows, macOS, and Linux. The landing page has no installer/release step — its hosting/deploy target isn't decided yet.
- Prefer TypeScript for new files.

## Electron security rules — always follow

- Every `BrowserWindow` uses `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
- Renderer code never calls `require()` or touches `ipcRenderer`/Node APIs directly — only through a `contextBridge` API defined in a preload script.
- Validate all IPC input on the `main` process side; treat the renderer as untrusted.
- No `remote` module, no `webSecurity: false`, no loading remote/untrusted URLs into a Node-enabled window.
- Set a Content-Security-Policy that disallows inline scripts unless explicitly justified.
- These rules apply only to `apps/desktop` — the landing page in `apps/web` never touches Electron APIs.

## Frontend

- Use Tailwind CSS + DaisyUI components in both apps; prefer DaisyUI components over hand-rolled markup.
- Support DaisyUI `light`/`dark` themes via `data-theme`, default to `prefers-color-scheme`, and let users override/persist the choice.
- Keep markup accessible: semantic elements, keyboard support, visible focus states, adequate contrast in both themes.
- Landing page: keep it lightweight and SEO-friendly — it's the first impression, not the app itself.

## Quality bar

- Least-privilege by default: don't add IPC channels, permissions, or network/filesystem access without a clear need.
- No committed secrets or signing certificates; `.env*` stays git-ignored.
- New logic gets unit tests; don't leave CI (lint/type-check/test/package smoke build) red.
- Don't add abstractions, dependencies, or features beyond what's requested — this project is early-stage and should stay minimal.

See `CLAUDE.md` at the repo root for the fuller version of these conventions.
