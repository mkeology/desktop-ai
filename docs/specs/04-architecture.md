# Architecture

**Audience:** Architect (and anyone making structural decisions).

## System context

Two independent deployables (see [Product Vision](./01-product-vision.md)):

```mermaid
flowchart LR
    subgraph Web["apps/web — landing page"]
        LP[Marketing site]
    end
    subgraph Desktop["apps/desktop — the product"]
        App[AI Workspace Electron app]
    end
    User((User)) -->|learns about product| LP
    LP -->|download link| User
    User -->|installs & runs| App
    App -->|real logins| Providers[(ChatGPT / Claude / Gemini / ...)]
    App -->|API calls| APIs[(OpenAI / Anthropic / Gemini / OpenRouter / Ollama)]
    App -->|local/SSH/Docker| Shells[(Shells & remote hosts)]
```

The landing page has no runtime relationship to the desktop app beyond linking to its installers — see [DevOps & Release](./07-devops-release.md).

## Process architecture (desktop app)

```mermaid
flowchart TB
    subgraph Main["Electron Main Process"]
        WM[Window management]
        WCV[WebContentsView management]
        SM[Session / partition management]
        IPC[IPC layer]
        SS[Secure storage: SQLite + OS keychain]
        PTY[Terminal / PTY management]
    end
    subgraph Renderer["Renderer (React + TypeScript)"]
        SB[Sidebar]
        PL[Provider list]
        TB[Tabs]
        SP[Split-pane layout]
        WSM[Workspace manager]
    end
    subgraph Sessions["Isolated Web Sessions"]
        S1["ChatGPT — Account 1\npartition: persist:chatgpt-account-1"]
        S2["ChatGPT — Account 2\npartition: persist:chatgpt-account-2"]
        S3["Claude — Account 1\npartition: persist:claude-account-1"]
    end

    Renderer <-->|IPC, typed & validated| IPC
    IPC --> WM
    IPC --> WCV
    IPC --> SM
    IPC --> SS
    IPC --> PTY
    WCV --> Sessions
    SM --> Sessions
```

- **Main process** owns everything with OS/Node access: windows, `WebContentsView`s, session partitions, the terminal PTYs, and the secure storage layer.
- **Renderer** is pure UI (React), reaching the main process only through a `contextBridge` API — see [Security](./06-security.md) for the hardening rules that make this boundary real.
- **Web sessions** are third-party provider pages loaded in their own `WebContentsView`, each bound to its own persistent partition, never an `<iframe>` (see [Agent Rules](./00-agent-rules.md) for why).

## The Session abstraction

Every activity in the product — a logged-in website, an API chat, a terminal — is a `Session`. This is the extension point for everything planned in later phases.

```mermaid
classDiagram
    class BaseSession {
        +string id
        +string name
        +string workspaceId
        +"web"|"api"|"terminal" type
    }
    class WebSession {
        +string url
        +string profileId
    }
    class ApiSession {
        +string provider
        +string model
    }
    class TerminalSession {
        +string shell
        +string cwd
    }
    BaseSession <|-- WebSession
    BaseSession <|-- ApiSession
    BaseSession <|-- TerminalSession
```

```mermaid
flowchart TB
    WS[Workspace] --> WEB[Web Sessions]
    WS --> API[API Sessions]
    WS --> TERM[Terminal Sessions]
```

Future capabilities (files, notebooks, browser automation, MCP tools, remote machines, agents) should be modeled as new `Session` variants or as controlled interactions *between* sessions (e.g. an API session with an explicit, revocable permission to act on a terminal session) — not as a parallel system.

## Data model

```mermaid
erDiagram
    PROVIDER ||--o{ ACCOUNT : has
    ACCOUNT ||--|| PARTITION : "isolated by"
    WORKSPACE ||--o{ SESSION : contains
    SESSION }o--|| PROVIDER : "web/api session refers to"
    WORKSPACE ||--|| LAYOUT : "saved as"

    PROVIDER {
        string id
        string name
        string url
        string icon
        string category
    }
    ACCOUNT {
        string id
        string providerId
        string name
        string partition
    }
    SESSION {
        string id
        string type
        string workspaceId
        string refId "accountId | apiConfigId | terminalConfigId"
    }
    WORKSPACE {
        string id
        string name
    }
    LAYOUT {
        string workspaceId
        json paneTree
    }
```

- **Providers and accounts** are data (catalog entries), not code — adding one is a catalog insert, never a feature branch.
- **SQLite** holds providers, accounts (metadata only, not secrets), sessions, workspaces, and layouts.
- **OS keychain / Electron `safeStorage`** holds API keys and any other secret — never SQLite, never plain files.
- Each account's cookies/localStorage live in their own Electron partition, managed by Chromium itself — the app never reads or copies that data directly.

## Settings & configuration

Settings live in a small JSON file under Electron's per-user `userData` directory (`app.getPath('userData')/settings.json`) — read/written only by the main process, never directly by the renderer. Today it holds corporate proxy config (HTTP/HTTPS proxy, no-proxy bypass list); on save, main applies it immediately via `session.defaultSession.setProxy(...)`, and re-applies it on every app start.

The **Settings window** is a second `BrowserWindow` rather than a view inside the main window — it needs its own native title bar and lifecycle (opened from the app menu's Preferences, or from the sidebar), and keeping it separate avoids complicating the main window's layout state. It's not a second app: both windows load the *same* renderer bundle, and a `?view=settings` query parameter (set by main when it creates the window) tells the renderer which top-level component to render. This avoids a second Vite entry point or a router dependency for what is, for now, a single small form.

```mermaid
sequenceDiagram
    participant U as User
    participant M as Main process
    participant SW as Settings window (renderer)

    U->>M: Menu: Preferences… / sidebar: Settings
    M->>SW: new BrowserWindow, load index.html?view=settings
    SW->>M: IPC settings:get (invoke)
    M-->>SW: current AppSettings
    U->>SW: Edit proxy fields, click Save
    SW->>M: IPC settings:set (invoke)
    M->>M: write settings.json, session.setProxy(...)
    M-->>SW: ack
    SW->>SW: window.close()
```

A proxy URL that embeds credentials (`http://user:pass@host`) is effectively a secret once typed in — see [Security](./06-security.md) for why that's a known, not-yet-closed gap in this first version.

## Sequence: opening an isolated web session

Implemented in `src/main/webSessions.ts` (main) and `ContentArea.tsx` (renderer). One `WebContentsView` per open web session tab, kept alive in the background when not the active tab rather than destroyed — switching back doesn't reload it.

```mermaid
sequenceDiagram
    participant U as User
    participant R as Renderer (ContentArea)
    participant M as Main process
    participant WCV as WebContentsView

    U->>R: Click "ChatGPT" in the sidebar
    R->>M: send web-session:open {sessionId, providerId, accountId, url}
    M->>M: partition = "persist:chatgpt-default" (no-op if sessionId already open)
    M->>WCV: new WebContentsView({webPreferences: {partition, sandbox: true, contextIsolation: true, nodeIntegration: false}})<br/>— no preload
    M->>WCV: loadURL(url)
    R->>M: send web-session:activate {sessionId}
    M->>WCV: setBounds(contentArea rect) — every other open view gets zero-size bounds
    Note over R,M: ContentArea's ResizeObserver keeps sending web-session:set-bounds<br/>whenever the pane resizes (window resize, sidebar collapse/expand)
```

This was verified against a live provider (DeepSeek): the `WebContentsView`'s own `webContents` loaded the real `chat.deepseek.com` page — confirmed by inspecting it as an independent target, title and URL matching the real site, not a stub.

## Non-functional requirements

- **Security:** `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` on every window/`WebContentsView`; no `remote` module; CSP on the app's own UI. Full detail in [Security](./06-security.md).
- **Cross-platform:** Windows, macOS, Linux from one codebase via Electron + electron-builder.
- **Scalability of sessions:** the architecture must tolerate many concurrent `WebContentsView`s (one per open account/tab) without unbounded memory growth — suspend/hibernate inactive sessions rather than keeping all of them fully live indefinitely (implementation detail for [Developer Guide](./05-developer-guide.md), constraint noted here).
- **Resilience to provider UI changes:** because provider sites are never scripted/injected, a provider redesigning their site cannot break the app's core function (isolated login) — only, at worst, cosmetic expectations.
