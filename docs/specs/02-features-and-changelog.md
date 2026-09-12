# Features & Changelog

**Audience:** everyone. This page is the single list of what exists, what's planned, and what changed between releases — keep it current.

## Feature status

Status values: `Planned` · `In Progress` · `Shipped`.

### Phase 1 — Desktop MVP

| Feature | Status |
|---|---|
| Electron shell (Windows/macOS/Linux) | In Progress — builds & runs on macOS; Windows/Linux packaging untested locally, covered by CI |
| Sidebar: searchable, collapsible accordion menu (AI Web Session/Web Apps/Terminal) | In Progress — real UX, static seed catalog underneath, no accounts yet; API Sessions is temporarily removed (see Phase 3) |
| Sessions: open/switch/close, one per provider (no duplicates) | Shipped — sidebar-driven (no separate tab bar); real for web sessions (isolated `WebContentsView`) and terminal (real shell); API still placeholder content, and off the sidebar for now |
| Native application menu (File/Edit/View/Window/Help) | Shipped |
| Light/dark theme, persisted, `Cmd/Ctrl+J` toggle | Shipped |
| Settings window: corporate proxy (HTTP/HTTPS/no-proxy) | Shipped — applied via `session.setProxy`; stored as plain JSON, see [Security](./06-security.md) known gap |
| Add custom website (arbitrary URL) | Shipped — persisted locally; renderer-only for now (see [Architecture](./04-architecture.md)) |
| Persistent login per session | Shipped — partitions are disk-persisted (`persist:` prefix), survives app restart |
| Isolated per-account profiles (`session.fromPartition`) | Shipped — one partition per (provider, account); real web pages load unmodified in their own `WebContentsView`, verified against a live provider site |
| Multiple accounts of the same provider | Planned — `accountId` is hardcoded to `"default"` until account-management UI exists |
| Split-screen / drag-resize panes | Planned |
| One-click installers, no config (Windows/macOS/Linux) | Shipped — real GitHub Release with installers for all 3 OSes (`v0.0.2`); **unsigned** (no code-signing cert configured yet, see [Security](./06-security.md)) |
| Custom app icon (window/taskbar/dock/installers, all 3 OSes) | Shipped |
| Automatic background updates | In Progress — `electron-updater` wired to check on launch, and the update feed (`latest*.yml`) is now published with each release; an older client actually picking up an update hasn't been end-to-end verified yet |
| Terminal session: real local shell (`node-pty` + xterm.js) | Shipped — one at a time; keeps running in the background across tab switches, with scrollback replayed on return; SSH/Docker/WSL targets not built |

### Phase 2 — AI-specific layer

| Feature | Status |
|---|---|
| Curated AI provider catalog with logos & categories | Shipped — real brand icons for most providers (Simple Icons); ChatGPT has none available and keeps its colored-initial fallback |
| Favorites / quick launch | Planned |
| Workspace presets (saved session layouts) | Planned |

### Phase 3 — API integration

| Feature | Status |
|---|---|
| Unified API chat session (OpenAI, Anthropic, Gemini, OpenRouter, Ollama, LM Studio) | Planned — sidebar entry point and store action were pulled out temporarily; the `ApiSession` type and a placeholder content view still exist |
| Per-provider "Web Login" + "API" mode toggle | Planned |

### Phase 4 — Agent capabilities (future, not committed)

| Feature | Status |
|---|---|
| SSH / Docker / WSL terminal targets | Planned — local shell is shipped (see Phase 1); these are additional targets for the same Terminal session type |
| Explicit, revocable AI-session → terminal permission | Planned |

## Product diffs (changelog)

Format: [Keep a Changelog](https://keepachangelog.com/) style, [SemVer](https://semver.org/). Newest first. Every entry should be understandable to an end user — link to [User Guide](./03-user-guide.md) sections where relevant, not internal code paths.

```
## [Unreleased]
### Added
- A real app icon (window, taskbar, dock, and installers on all three
  OSes) — no more default Electron icon.
- Real brand icons for AI Web Session and Web Apps entries (Claude,
  Gemini, Perplexity, DeepSeek, Moonshot, GitHub Copilot, Mistral, Gmail,
  Notion), replacing the colored-initial placeholder for those. ChatGPT
  has no available brand icon and keeps the initial.
- Collapsed sidebar (**«**) now shows every catalog entry as an icon-only
  vertical rail instead of just the expand button — still clickable,
  still highlights whichever session is active.
- **Local Shell** under **Terminal** now opens a real terminal (your
  actual default shell, via a native pseudo-terminal), not a placeholder.
  It keeps running in the background when you switch to another session,
  and its scrollback replays when you switch back.

### Changed
- Removed the tab bar above the content area. The sidebar itself is now
  the only place sessions are opened and switched: an open entry is
  highlighted and grows a **✕** to close it; clicking an already-open
  entry brings it to the front instead of opening a duplicate. Applies to
  AI Web Session, Web Apps, and API sessions (one per provider) and
  Terminal (one at a time).

### Fixed
- macOS releases now publish both an Apple Silicon (`arm64`) and an Intel
  (`x64`) `.dmg`/`.zip` — previously only `arm64` was built, so the app
  wouldn't run at all on an Intel Mac.

### Removed
- The **API Sessions** section is temporarily off the sidebar and the
  **File** menu (no unified API chat exists yet — see
  [Features & Changelog](#feature-status), Phase 3). Nothing was deleted
  under the hood; it's coming back once that feature is actually built.

## [0.0.3] - 2026-09-10
### Fixed
- Content window going blank after opening several web sessions (reported
  on Windows, noticed around the 5th/6th tab). Inactive sessions were
  hidden by resizing them to zero instead of detaching them from the
  window — a known-flaky pattern in Electron's `WebContentsView` where the
  page keeps rendering correctly underneath but the compositor doesn't
  reliably repaint it once resized back. Switched to attaching only the
  active session's view and detaching everything else.

## [0.0.2] - 2026-09-10
### Added
- Desktop app skeleton: Electron + React + TypeScript shell with sidebar,
  session tabs, native application menu, and a light/dark theme system
  (Tailwind + DaisyUI). Sessions open as placeholder panels — no real
  provider logins, API calls, or terminals yet.
- Sidebar redesigned as a searchable, collapsible panel: one search box
  filters four expandable sections (AI Web Session/Web Apps/API/Terminal),
  and a bottom menu opens Settings and the light/dark switch.
- Settings window with corporate proxy configuration (HTTP proxy, HTTPS
  proxy, no-proxy list), applied immediately and re-applied on every launch.
- Added DeepSeek, Moonshot (Kimi), GitHub Copilot, and Mistral to the
  built-in AI Web Session catalog.
- Split the sidebar's web catalog into **AI Web Session** and **Web
  Apps** — an AI provider (Gemini) and a general web app (Gmail) are no
  longer lumped into one list.
- The Web Apps catalog is now user-extensible: "+ Add website" registers
  any URL, persisted locally and removable.
- Web sessions now open for real: clicking a provider loads its actual
  site in an isolated, persistent browser view on the right — not a
  placeholder. Each provider gets its own storage, separate from every
  other provider and from the app itself.
- CI/CD: automated GitHub Actions pipeline that lints/tests/builds every
  change, plus a two-step release flow (Propose Release opens a
  version-bump PR; merging it tags and publishes signed installers for
  Windows, macOS, and Linux).

### Fixed
- Several release-pipeline issues found only by actually running a real
  release end-to-end: a missing `repository` field that broke
  electron-builder's CI detection on every OS; an empty (unset-secret)
  `CSC_LINK` crashing macOS signing instead of skipping it; the Linux
  `.deb` target's maintainer requirement; `npm version`'s own stdout
  noise corrupting a captured version string; a stale lockfile version;
  and electron-builder silently skipping publish because the release job
  runs under a `pull_request` event.

**Note:** `0.0.1` was never published as a release — it was superseded by
this version during the pipeline fixes above before anyone downloaded it.
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
