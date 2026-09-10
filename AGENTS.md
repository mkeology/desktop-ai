# AGENTS.md — Agent Instructions

Instructions for Codex (Codex / Codex in GitHub) working in this repository.

## What this project is

Two separate apps that share a design system, not one codebase:

- **Web app** — a marketing/**landing page** for the software product. Static/server-rendered site, no Electron, no product functionality. Its job is to explain and sell the desktop app (and link to its downloads).
- **Desktop app** — **the actual product**, built with **Electron + Node.js**, packaged and code-signed for **Windows, macOS, and Linux**.

Suggested layout (adjust once specs land): `apps/web` (landing page) and `apps/desktop` (Electron product), optionally a shared `packages/ui` or `packages/config` for the common Tailwind/DaisyUI theme so both look like the same brand. Don't leak Electron-only code into the landing page, and don't put product logic in the landing page — it's marketing surface only.

> **Product specs live in [`docs/specs/`](./docs/specs/README.md).** Read [`docs/specs/00-agent-rules.md`](./docs/specs/00-agent-rules.md) before implementing product features — it defines the Session/Workspace model, the account-isolation rules, and what's still undecided. This file covers *how* to write code here; `docs/specs/` covers *what the product is*.

## Stack

| Layer | Choice |
|---|---|
| Desktop shell | Electron (latest stable) |
| Runtime | Node.js (current LTS) |
| Styling | Tailwind CSS + DaisyUI, with **dark and light** themes |
| CI/CD | GitHub Actions — build on every PR, release on tag push |
| Packaging | electron-builder, targeting Windows (nsis), macOS (dmg/zip, notarized), Linux (AppImage/deb) |

Use TypeScript for new source files unless the surrounding file is already plain JS. Don't introduce a second frontend framework, state library, or CSS system without discussing it first — one of everything.

## Architecture rules (Electron)

- **Process separation is mandatory**: `main` (Node/OS access), `preload` (the only bridge), `renderer` (UI, no direct Node access).
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` on every `BrowserWindow`. Never set these to loosen security to "make something easier."
- Renderer talks to the OS only through a `contextBridge`-exposed API defined in preload. No `require()`, no `ipcRenderer` leaking directly into the page.
- Validate and narrow every IPC message on the `main` side — treat the renderer as an untrusted boundary, especially once remote content or user-loaded files are involved.
- No `remote` module. No loading remote URLs into a window that has Node access. No `webSecurity: false`.
- Set a Content-Security-Policy (meta tag or session header) that blocks inline scripts unless there's a hashed/nonce exception with a documented reason.
- The landing page (`apps/web`) never imports Electron APIs or ships main/preload code — it's a plain website.

## Security practices (both web & desktop)

- Least privilege by default: new permissions, IPC channels, or filesystem/network access must be justified, not added speculatively.
- Keep dependencies patched; treat `npm audit`/Dependabot alerts as real work, not noise.
- Never commit secrets, API keys, or signing certificates. `.env*` stays out of git (already in `.gitignore`).
- Auto-update (when added) must verify update signatures/checksums before applying.
- Sanitize/escape any user-provided content rendered as HTML.

## Frontend conventions

- Tailwind CSS + DaisyUI in both apps, sharing one theme/brand config so the landing page and the desktop app look related. Support DaisyUI's `light`/`dark` themes via the `data-theme` attribute, default to the OS/browser preference (`prefers-color-scheme`), and let the user override and persist their choice.
- Prefer DaisyUI components over hand-rolled ones; only drop to raw Tailwind utility classes when DaisyUI has no matching component.
- Keep components accessible: semantic HTML, keyboard navigation, visible focus states, sufficient color contrast in both themes.
- The landing page should stay lightweight (fast load, good SEO/meta tags) — it's the first impression, not the app.

## Testing

- New logic needs unit tests. Electron main-process code and preload bridges need tests that don't require a real display where possible.
- Before claiming a UI change works, actually run it (`npm run dev` / the Electron app) rather than relying on type-checking alone.
- CI (`.github/workflows/ci.yml`) must stay green: lint, type-check, unit tests, and a packaging smoke build on all three OSes.

## Build & release

- **Desktop app**: releases are cut by pushing a `v*.*.*` tag; `.github/workflows/release.yml` builds installers for Windows/macOS/Linux via electron-builder and publishes them as GitHub Release assets. Version bumps follow SemVer and go through `package.json`.
- **Web app**: has no installer/release process — it deploys as a normal site. Hosting target (Pages, Vercel, Netlify, etc.) is not decided yet; don't wire up a deploy workflow until that's specified.
- Don't hand-edit generated build/dist output; it's git-ignored.

## Working style

- Don't add features, abstractions, or config beyond what's asked. This repo is early-stage scaffolding — keep it minimal and easy to build on.
- Where `docs/specs/` and this file disagree, treat it as a doc bug and flag it rather than silently picking one (see [`docs/specs/00-agent-rules.md`](./docs/specs/00-agent-rules.md)).
