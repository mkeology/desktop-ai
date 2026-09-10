# Features & Changelog

**Audience:** everyone. This page is the single list of what exists, what's planned, and what changed between releases — keep it current.

## Feature status

Status values: `Planned` · `In Progress` · `Shipped`.

### Phase 1 — Desktop MVP

| Feature | Status |
|---|---|
| Electron shell (Windows/macOS/Linux) | In Progress — builds & runs on macOS; Windows/Linux packaging untested locally, covered by CI |
| Sidebar: searchable, collapsible accordion menu (AI Web Session/Web Apps/API/Terminal) | In Progress — real UX, static seed catalog underneath, no accounts yet |
| Tabs (open/switch/close) | In Progress — real for web sessions (isolated `WebContentsView`); still placeholder content for API/terminal |
| Native application menu (File/Edit/View/Window/Help) | Shipped |
| Light/dark theme, persisted, `Cmd/Ctrl+J` toggle | Shipped |
| Settings window: corporate proxy (HTTP/HTTPS/no-proxy) | Shipped — applied via `session.setProxy`; stored as plain JSON, see [Security](./06-security.md) known gap |
| Add custom website (arbitrary URL) | Shipped — persisted locally; renderer-only for now (see [Architecture](./04-architecture.md)) |
| Persistent login per session | Shipped — partitions are disk-persisted (`persist:` prefix), survives app restart |
| Isolated per-account profiles (`session.fromPartition`) | Shipped — one partition per (provider, account); real web pages load unmodified in their own `WebContentsView`, verified against a live provider site |
| Multiple accounts of the same provider | Planned — `accountId` is hardcoded to `"default"` until account-management UI exists |
| Split-screen / drag-resize panes | Planned |
| One-click installers, no config (Windows/macOS/Linux) | In Progress — electron-builder configured & smoke-tested unsigned on macOS; signing/notarization untested |
| Automatic background updates | In Progress — `electron-updater` wired to check on launch in production builds; no published feed yet |

### Phase 2 — AI-specific layer

| Feature | Status |
|---|---|
| Curated AI provider catalog with logos & categories | Planned |
| Favorites / quick launch | Planned |
| Workspace presets (saved session layouts) | Planned |

### Phase 3 — API integration

| Feature | Status |
|---|---|
| Unified API chat session (OpenAI, Anthropic, Gemini, OpenRouter, Ollama, LM Studio) | Planned |
| Per-provider "Web Login" + "API" mode toggle | Planned |

### Phase 4 — Agent capabilities (future, not committed)

| Feature | Status |
|---|---|
| Terminal sessions (local shell / SSH / Docker / WSL) | Planned |
| Explicit, revocable AI-session → terminal permission | Planned |

## Product diffs (changelog)

Format: [Keep a Changelog](https://keepachangelog.com/) style, [SemVer](https://semver.org/). Newest first. Every entry should be understandable to an end user — link to [User Guide](./03-user-guide.md) sections where relevant, not internal code paths.

```
## [Unreleased]

## [0.0.1] - 2026-09-10
### Added
- Desktop app skeleton: Electron + React + TypeScript shell with sidebar,
  session tabs, native application menu, and a light/dark theme system
  (Tailwind + DaisyUI). Sessions open as placeholder panels — no real
  provider logins, API calls, or terminals yet.
- Sidebar redesigned as a searchable, collapsible panel: one search box
  filters three expandable sections (Web/API/Terminal), and a bottom menu
  opens Settings and the light/dark switch.
- Settings window with corporate proxy configuration (HTTP proxy, HTTPS
  proxy, no-proxy list), applied immediately and re-applied on every launch.
- Added DeepSeek, Moonshot (Kimi), GitHub Copilot, and Mistral to the
  built-in AI Providers catalog.
- Split the sidebar's web catalog into **AI Providers** and **Web Apps** —
  an AI provider (Gemini) and a general web app (Gmail) are no longer
  lumped into one list.
- The Web Apps catalog is now user-extensible: "+ Add website" registers
  any URL, persisted locally and removable.
- Renamed the sidebar's "AI Providers" section to "AI Web Session".
- Web sessions now open for real: clicking a provider loads its actual
  site in an isolated, persistent browser view on the right — not a
  placeholder. Each provider gets its own storage, separate from every
  other provider and from the app itself.
- CI/CD: automated GitHub Actions pipeline to lint/test/build every change,
  plus a one-click way to cut a signed release for Windows, macOS, and
  Linux from `main`.
```

> Agents: when a release ships, add an entry above following this template:
>
> ```
> ## [x.y.z] - YYYY-MM-DD
> ### Added
> - ...
> ### Changed
> - ...
> ### Fixed
> - ...
> ### Removed
> - ...
> ```
