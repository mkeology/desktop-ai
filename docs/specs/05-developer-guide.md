# Developer Guide

**Audience:** Developer. Pairs with [Architecture](./04-architecture.md); engineering/style rules live in [`CLAUDE.md`](../../CLAUDE.md) and [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) — this page is product-specific implementation guidance, not restated style rules.

## Repo layout

```
apps/
  web/       # landing page — plain website, no Electron, no product logic
  desktop/   # AI Workspace — the Electron product
packages/
  ui/        # shared Tailwind/DaisyUI theme & components, if/when needed by both apps
docs/
  specs/     # this folder
```

`apps/desktop` actual shape (built with [electron-vite](https://electron-vite.org), whose main/preload/renderer split matches [Architecture](./04-architecture.md) directly):

```
apps/desktop/
  electron.vite.config.ts   # main/preload/renderer build config (+ @shared alias, __APP_VERSION__)
  electron-builder.yml      # packaging — see docs/specs/07-devops-release.md
  src/
    main/
      index.ts       # windows (main + settings), menu wiring, CSP, auto-update
      menu.ts        # native application menu
      settings.ts    # settings.json read/write + session.setProxy
      webSessions.ts # WebContentsView lifecycle + partitioning per web session
      __tests__/
    preload/
      index.ts       # the ONLY contextBridge API surface
      index.d.ts      # types the exposed API for the renderer
    renderer/
      index.html
      src/
        App.tsx        # main window
        SettingsWindow.tsx  # settings window — same bundle, ?view=settings
        main.tsx, index.css
        components/  # Sidebar, SidebarAccordion, SidebarBottomMenu, AddProviderForm, ContentArea, ChevronDownIcon
        hooks/       # useDismissablePopover — shared dropdown/popover open+close behavior
        state/       # useWorkspaceStore (zustand) — tabs, theme, sidebar
    shared/          # imported by main, preload, AND renderer via `@shared/*`
      session.ts     # the Session discriminated union
      providers.ts   # seed provider catalog (data, not code)
      settings.ts    # AppSettings / ProxySettings shape + defaults
      ipc.ts         # menu + settings + web-session IPC channel names, typed on both ends
```

As real features land, `main/terminal/` (PTY) and `main/storage/` (SQLite + `safeStorage`) get added under `main/` per [Architecture](./04-architecture.md) — not built yet.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Desktop shell | Electron | Only option giving real, isolated Chromium sessions per account (see [Architecture](./04-architecture.md)) |
| UI | React + TypeScript | Renderer-side component model for sidebar/tabs/panes |
| Build tooling | Vite | Fast renderer builds/dev server |
| Embedded web apps | Electron `WebContentsView` | Not `<iframe>` — see [Agent Rules](./00-agent-rules.md) |
| Account isolation | Electron sessions/partitions | `session.fromPartition` per account |
| Structured storage | SQLite | Providers, accounts (metadata), sessions, workspaces, layouts |
| Secrets | OS keychain / Electron `safeStorage` | API keys, tokens — never in SQLite or plain files |
| Terminal | `node-pty` (main) + `xterm.js` (renderer) | Real shell, not a simulated one |
| Styling | Tailwind CSS + DaisyUI | Shared with the landing page; dark/light themes |
| Packaging | electron-builder | Windows/macOS/Linux installers — see [DevOps & Release](./07-devops-release.md) |

## Implementing account isolation

Each account gets its own persistent partition, created once and reused:

```ts
import { session } from "electron";

const chatgptPersonal = session.fromPartition("persist:chatgpt-personal");
const chatgptWork = session.fromPartition("persist:chatgpt-work");
```

Partition name is derived from the account id, not the provider id — two accounts of the same provider must never resolve to the same partition string.

## Adding a provider to the catalog

Providers are data. A new entry looks like:

```json
{
  "id": "notion",
  "name": "Notion",
  "url": "https://notion.so",
  "icon": "notion.svg",
  "category": "productivity"
}
```

An AI provider additionally documents its account shape (accounts themselves are created by the user at runtime, not hardcoded):

```json
{
  "id": "chatgpt",
  "name": "ChatGPT",
  "url": "https://chatgpt.com",
  "category": "ai",
  "modes": ["web", "api"]
}
```

Adding a provider should never require touching `main` process session logic — only a catalog entry (and, if it's an AI provider, wiring for its API mode in Phase 3).

## IPC conventions

- Every channel is typed on both ends; define the shape once (e.g. a shared `ipc-contract.ts`) and import it from both `main` and `preload`.
- `main` validates every payload it receives — the renderer is an untrusted boundary even though it's first-party code (see [`CLAUDE.md`](../../CLAUDE.md)).
- Name channels by resource and verb, e.g. `session:open`, `workspace:save`, `terminal:write` — not generic `invoke`/`send` catch-alls.

## Session lifecycle notes

- Inactive sessions (tabs not currently visible) should be suspendable rather than kept fully live forever — see the scalability note in [Architecture](./04-architecture.md). Don't build this in the MVP if it's not needed yet, but don't architect session state in a way that makes it impossible later.
- Terminal sessions must not be reachable from an API/AI session without going through an explicit permission check — see [Security](./06-security.md) before touching this code path.

## Local development

- `npm install` at the repo root (npm workspaces across `apps/*`).
- `npm run dev` — starts the desktop app in dev mode (Vite renderer + Electron main with reload).
- `npm test` — unit tests; main-process/session logic should be testable without a real display where feasible.
- `npm run build` — production build of both apps.
- Actually launch the app and exercise a change (open a provider, add a second account, split-screen) before calling a UI change done — see [`CLAUDE.md`](../../CLAUDE.md)'s testing section.

## Definition of done

A feature isn't done until:

1. It works when you actually run the app (not just type-checks).
2. [Features & Changelog](./02-features-and-changelog.md) is updated.
3. Any user-facing behavior is reflected in the [User Guide](./03-user-guide.md).
4. Security-relevant changes (new IPC channel, new permission, anything touching sessions/terminal/secrets) are checked against [Security](./06-security.md).
