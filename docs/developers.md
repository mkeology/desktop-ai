# AI Workspace — Developer Guide

Setup, build, test, and release instructions for contributors. Looking for the product itself? See the [root README](../README.md).

A desktop workspace that keeps every AI provider, API, and terminal you use in its own isolated, persistent session — organized into workspaces you can switch between instantly. See [`docs/specs/`](./specs/README.md) for the full product vision and architecture.

This repository is a monorepo:

- **`apps/desktop`** — the product itself: an Electron + React + TypeScript desktop app for Windows, macOS, and Linux.
- **`apps/web`** — a marketing landing page (not scaffolded yet).

## Prerequisites

- **Node.js 22** (or Node 20.19+) — required by the build tooling.
- **npm** (ships with Node).

## Install

From the repository root (this installs both apps via npm workspaces):

```sh
npm install
```

## Run it (development)

```sh
npm run dev
```

This starts the desktop app with hot reload — it opens a real Electron window. Try:

- Click a provider in the sidebar to open a session tab.
- **Cmd/Ctrl+J** — toggle light/dark theme.
- **Cmd/Ctrl+B** — toggle the sidebar.
- The **File** menu can also open new sessions; **View** has the same theme/sidebar toggles.

See [Features & Changelog](./specs/02-features-and-changelog.md) for what's actually implemented vs. still a placeholder.

## Build & package installers

```sh
npm run build   # production bundle (all platforms, from any OS)
cd apps/desktop
npm run dist:mac    # or dist:win / dist:linux — packages an installer for that OS
```

Cross-compiling installers for another OS from your current machine isn't reliable (especially macOS `.dmg`/notarization) — the GitHub Actions release workflow (below) builds all three properly, on native runners.

## Checks

Run from the repository root:

```sh
npm run lint        # ESLint
npm run typecheck   # TypeScript, no emit
npm test            # Vitest
```

CI (`.github/workflows/ci.yml`) runs all of these plus a packaging smoke build on every push/PR.

## Releasing

Two steps, since `main` requires every change to go through a reviewed PR:

1. Go to the **Actions** tab → **Propose Release** → **Run workflow** (from `main`, pick patch/minor/major). It opens a PR bumping the version.
2. Review and merge that PR. Merging it automatically tags the release and builds + publishes signed installers for Windows, macOS, and Linux as a GitHub Release.

(Pushing a `v*.*.*` tag yourself also works, via `.github/workflows/release.yml`, as a manual fallback.) See [DevOps & Release](./specs/07-devops-release.md) for what "signed" requires (secrets) and how auto-update works.

## Updating (once installed)

The app checks for updates automatically and applies them in the background — no manual download step. See the [User Guide](./specs/03-user-guide.md).

## Contributing

Pull requests, issues, and feature requests are welcome — see [Contributing](../README.md#contributing) in the root README.

## Project docs

Start at [`docs/specs/README.md`](./specs/README.md) for the full spec set (product vision, architecture, security, developer guide, DevOps). Engineering conventions for AI coding agents live in [`CLAUDE.md`](../CLAUDE.md) and [`.github/copilot-instructions.md`](../.github/copilot-instructions.md).
