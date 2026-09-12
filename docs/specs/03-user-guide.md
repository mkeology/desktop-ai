# User Guide

**Audience:** final users — anybody. No technical background assumed.

## What AI Workspace is

One desktop app where you keep every AI provider (ChatGPT, Claude, Gemini, ...), each of your accounts for them, and your own web apps (Gmail, Notion, Slack, ...) — all logged in, all remembered, organized into workspaces you can switch between instantly.

## Installing — must be really easy

No accounts, no setup wizard, no configuration screen. Download, run the installer, open the app.

| Platform | What you do |
|---|---|
| **Windows** | Download the `.exe`, double-click, click through the installer. No admin password needed for a per-user install. |
| **macOS** | Download the `.dmg` (Apple Silicon and Intel both published), drag **AI Workspace** into **Applications**, open it. **Not signed/notarized yet** (see [Security](./06-security.md)), so macOS shows "'AI Workspace' is damaged and can't be opened" on first launch — it isn't actually damaged. Run `xattr -cr "/Applications/AI Workspace.app"` once, then open normally. |
| **Linux** | Download the `.AppImage` (make it executable and run it) or the `.deb`/`.rpm` package for your distro. |

That's the whole process. First launch opens straight to an empty workspace with an "Add provider" / "Add app" prompt — no login or account creation required to start using the app itself.

## Updating — must be really easy

You never manually download an update. AI Workspace checks for updates automatically:

- On every launch, and periodically while running.
- When one's available, it downloads in the background — no interruption to what you're doing.
- You'll see a small "Update ready — Restart to apply" notice; restart whenever suits you (or it applies next time you quit and reopen).
- A "Check for updates" menu item exists for anyone who wants to check manually, but it's never required.

## Core concepts

- **Provider** — an AI service or web app (ChatGPT, Claude, Gmail, ...).
- **Account** — one login for a provider. You can add several accounts for the same provider (e.g. "ChatGPT Personal" and "ChatGPT Work") and they never share cookies or history.
- **Session** — an open instance of a provider account, an API chat, or a terminal. You open and switch between sessions from the sidebar itself (see below) rather than a separate tab bar.
- **Workspace** — a saved arrangement of sessions (which ones, and how they're split on screen) that you can switch to or restore in one click.

## The sidebar

The left panel is how you start every session:

- A **search box** at the top filters everything below it as you type.
- Three collapsible sections — **AI Web Session** (ChatGPT, Claude, Gemini, DeepSeek, Moonshot, Copilot, Mistral, ...), **Web Apps** (Gmail, Notion, and anything you add), **Terminal** — each expands in place (click its header) to show its entries, so you only see what you're looking for. Each entry shows a small colored icon and its name. (API Sessions is temporarily off the sidebar until that feature is actually built — see [Features & Changelog](./02-features-and-changelog.md).)
- **The sidebar is also how you switch between what's open** — there's no separate row of tabs anywhere else. An entry you've opened is highlighted and grows a small **✕** to close it; clicking an already-open entry again just brings it to the front instead of opening a second copy of it.
- Click the **«** button (or press **Cmd/Ctrl+B**) to collapse the sidebar down to a thin strip of icons when you want more room — everything's still one click away, just without labels; **»** brings the full sidebar back.
- The bottom of the sidebar has a **Menu** button that opens **Settings**, the **light/dark theme** switch, and the app's version, GitHub link, and copyright — see below.

## Using it

1. **Add a provider or app** — expand **AI Web Session** or **Web Apps** in the sidebar and pick one, or use **+ Add website** at the bottom of **Web Apps** to register any URL yourself. Picking one you've already opened just switches to it — you won't end up with duplicates.
2. **Log in** — it's the provider's real website; log in the normal way. AI Workspace remembers you.
3. **Add another account** — add the same provider again under a different account name to keep, e.g., work and personal completely separate.
4. **Arrange your view** — open several sessions side by side with split-screen; drag panes to resize.
5. **Save it as a workspace** — name your current layout so you can jump back to it later in one click.
6. **Terminal** — expand **Terminal** and pick **Local Shell** to open a real terminal (your default shell) right alongside your AI sessions. It keeps running in the background when you switch away, so you don't lose your place; SSH/Docker terminals are a possible future addition.
7. **API sessions** (not in the sidebar for the moment) — a future unified API-key chat interface, alongside the website-based sessions above.

## Settings

Open **Settings** from the sidebar's bottom menu (or **AI Workspace → Preferences…** on macOS, **File → Settings…** on Windows/Linux). Today it holds:

- **Corporate proxy** — HTTP proxy, HTTPS proxy, and a no-proxy bypass list, for networks that require one. Applies to web and API sessions.

More settings land here over time rather than spreading across separate screens.

## Data & privacy, in short

- Your accounts' cookies and data stay isolated on your own machine, per account.
- API keys and other secrets are stored using your operating system's secure credential storage, not as plain text.
- AI Workspace doesn't modify or read the content of provider websites beyond normal browsing — see [Security](./06-security.md) if you want the details.

## Getting help

Full feature list and what's new in each release: [Features & Changelog](./02-features-and-changelog.md). For anything not covered here, ask — this guide will grow as features ship.
