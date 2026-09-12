# Security

**Audience:** Architect, Developer, DevOps. End users get the plain-language summary in [User Guide](./03-user-guide.md#data--privacy-in-short).

## Threat model, in short

The product's core risks come from three places:

1. **Embedding third-party AI provider sites** inside the app.
2. **Running local/remote shell commands** on the user's behalf.
3. **Holding credentials** (provider logins via cookies, API keys) for many accounts at once.

## Hard rules

These are non-negotiable — see [Agent Rules](./00-agent-rules.md) for how to treat them.

### Embedding & session isolation

- Every `BrowserWindow` and `WebContentsView` uses `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. No exceptions to "make something easier."
- No `remote` module. No `webSecurity: false`.
- Third-party provider sites are loaded in their own `WebContentsView`, never an `<iframe>` — and never with a shared partition across accounts. One account = one `session.fromPartition(...)`, permanently.
- **Never inject scripts into a provider's page** to read, modify, or automate its UI, except a narrow, user-requested, explicitly scoped exception. The app does not scrape or manipulate ChatGPT/Claude/Gemini/etc. — it just gives the user an isolated window onto the real site.
- A Content-Security-Policy governs the app's *own* UI (renderer chrome); it does not and cannot restrict what a provider's own site does on its own page — that's the provider's responsibility, as it would be in any browser.

### IPC & the renderer boundary

- The renderer never gets direct Node/Electron API access — only a `contextBridge` surface defined in preload.
- `main` validates every IPC payload; the renderer is treated as an untrusted boundary even though it's first-party code.

### Terminal sessions

- A human opening **Local Shell** from the sidebar gets a real, unrestricted shell — exactly as if they'd opened their OS's own terminal app. That's the intended, shipped feature (`node-pty` + `xterm.js`, see [Architecture](./04-architecture.md#sequence-opening-a-terminal-session)), not a gap: it's the user acting directly, not an AI acting on their behalf.
- That is categorically different from, and must never be confused with, the rule below: **no AI/API session has terminal access by default. Ever.** This second capability (an AI session driving a terminal session) is not built — Phase 3/4 in [Features & Changelog](./02-features-and-changelog.md) — and the rules below apply to it whenever it is:
  - Granting an API session the ability to act on a terminal session is an explicit, per-session, user-initiated, revocable permission — never a global setting turned on once and forgotten.
  - Commands classified as destructive (file deletion, force-push, `rm -rf`-shaped patterns, etc.) require interactive confirmation even when a permission has been granted.
  - SSH/Docker/WSL terminal targets are configured by the user explicitly; the app doesn't auto-discover or auto-connect to remote hosts.

### Secrets

- API keys, tokens, and any other credential are stored via the OS keychain / Electron `safeStorage` — never in SQLite, never in a plain config file, never logged.
- Cookies/localStorage for provider accounts are managed entirely by Chromium's per-partition storage; the app does not read, copy, or export them.
- **Known gap:** the corporate proxy settings (`settings.json`, see [Architecture](./04-architecture.md#settings--configuration)) are stored as plain JSON. A proxy URL that embeds credentials (`http://user:pass@host`) is a secret and doesn't belong there long-term — move it to `safeStorage` before this ships beyond internal use.

### Updates & supply chain

- Installers and auto-updates *should* be code-signed (macOS notarized, Windows Authenticode) so the OS and the updater can verify integrity before installing — see [DevOps & Release](./07-devops-release.md). **Known gap:** no signing certificate is configured yet, so releases currently ship unsigned; macOS users hit a Gatekeeper "damaged" false-positive as a result (documented workaround in the [User Guide](./03-user-guide.md)). Set this up before recommending the app beyond early testers.
- Dependencies are kept patched; audit alerts (`npm audit`, Dependabot) are treated as real work, not noise.
- No secrets or signing certificates are ever committed to the repo.

## Data classification

| Data | Where it lives | Leaves the device? |
|---|---|---|
| Provider account cookies/localStorage | Per-account Electron partition, on disk | No — never read/exported by the app |
| API keys | OS keychain / `safeStorage` | Only sent directly to the corresponding provider's API by the app, per the user's own request |
| Provider catalog, workspace layouts | Local SQLite | No |
| Chat/API content | Sent directly to the chosen provider's API, per normal use | Yes, to that provider, same as using their API directly |
| Terminal input/output | In-memory / local PTY | No, unless the session is explicitly an SSH session to a host the user configured |

## Reporting a vulnerability

Placeholder until a real process exists — do not publish a security contact or process without the user confirming one. Flag any suspected vulnerability found during development directly to the user rather than filing it publicly.
