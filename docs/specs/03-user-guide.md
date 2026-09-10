# User Guide

**Audience:** final users — anybody. No technical background assumed.

## What AI Workspace is

One desktop app where you keep every AI provider (ChatGPT, Claude, Gemini, ...), each of your accounts for them, and your own web apps (Gmail, Notion, Slack, ...) — all logged in, all remembered, organized into workspaces you can switch between instantly.

## Installing — must be really easy

No accounts, no setup wizard, no configuration screen. Download, run the installer, open the app.

| Platform | What you do |
|---|---|
| **Windows** | Download the `.exe`, double-click, click through the installer. No admin password needed for a per-user install. |
| **macOS** | Download the `.dmg`, drag **AI Workspace** into **Applications**, open it. Signed and notarized, so no "unidentified developer" warning. |
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
- **Session** — an open instance of a provider account, an API chat, or a terminal, running in a tab or pane.
- **Workspace** — a saved arrangement of sessions (which ones, and how they're split on screen) that you can switch to or restore in one click.

## The sidebar

The left panel is how you start every session:

- A **search box** at the top filters everything below it as you type.
- Four collapsible sections — **AI Web Session** (ChatGPT, Claude, Gemini, DeepSeek, Moonshot, Copilot, Mistral, ...), **Web Apps** (Gmail, Notion, and anything you add), **API Sessions**, **Terminal** — each expands in place (click its header) to show its entries, so you only see what you're looking for. Each entry shows a small colored icon and its name.
- Click the **«** button (or press **Cmd/Ctrl+B**) to collapse the sidebar down to a thin strip when you want more room; **»** brings it back.
- The bottom of the sidebar has a **Menu** button that opens **Settings**, the **light/dark theme** switch, and the app's version, GitHub link, and copyright — see below.

## Using it

1. **Add a provider or app** — expand **AI Web Session** or **Web Apps** in the sidebar and pick one, or use **+ Add website** at the bottom of **Web Apps** to register any URL yourself.
2. **Log in** — it's the provider's real website; log in the normal way. AI Workspace remembers you.
3. **Add another account** — add the same provider again under a different account name to keep, e.g., work and personal completely separate.
4. **Arrange your view** — open several sessions side by side with split-screen; drag panes to resize.
5. **Save it as a workspace** — name your current layout so you can jump back to it later in one click.
6. **API sessions** (once available) — add a provider's API key to chat through a unified interface instead of (or alongside) its website.
7. **Terminal sessions** (once available) — open a local shell, SSH, or Docker terminal as just another session in your workspace.

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
