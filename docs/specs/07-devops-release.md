# DevOps & Release

**Audience:** DevOps. Reflects the actual workflows in [`.github/workflows/`](../../.github/workflows/) — keep this page and those files in sync.

## Pipeline overview

```mermaid
flowchart LR
    PR[Push / PR to main] --> CI[ci.yml\nlint, typecheck, test, build,\npackage smoke build x3 OS]
    Dispatch["Run 'Tag & Release'\n(from main, pick patch/minor/major)"] --> TAG[tag-release.yml: tag job\nbump version, commit, tag]
    TAG --> RELJOB[tag-release.yml: release job\nbuild + sign + publish x3 OS]
    ManualTag["Tag push v*.*.* (pushed by a person)"] --> REL[release.yml\nbuild + sign + publish\ninstallers x3 OS]
    RELJOB --> GH[GitHub Release]
    REL --> GH
    GH --> Updater[electron-updater\nfeed]
```

- **`ci.yml`** — every push/PR to `main`: lint, typecheck, unit tests, build, and an electron-builder `--dir` smoke package on Ubuntu, macOS, and Windows. Must stay green; it's the only gate before merge.
- **`tag-release.yml`** — the normal way to cut a release: trigger it manually (Actions tab → "Tag & Release" → Run workflow, from `main`, choosing a patch/minor/major bump). It bumps `apps/desktop/package.json`, commits that to `main`, tags it, then builds and publishes installers for all three OSes in the same run.
- **`release.yml`** — a fallback: if a person pushes a `v*.*.*` tag themselves (with their own git credentials), this builds and publishes for all three OSes the same way. Exists because a tag/commit pushed *by* a workflow using the default `GITHUB_TOKEN` deliberately does not re-trigger other workflows (GitHub's loop prevention) — so `tag-release.yml` can't just push a tag and rely on this one to pick it up; it does the release itself.
- The landing page (`apps/web`) has **no packaging/signing step** — it deploys as a normal site once a hosting target is chosen (not decided yet, see [Product Vision](./01-product-vision.md)).

## Versioning

- SemVer (`MAJOR.MINOR.PATCH`), bumped in `apps/desktop/package.json` — normally by running **Tag & Release** (`tag-release.yml`) rather than by hand.
- A release is a git tag `vX.Y.Z` on `main`.
- Every release gets an entry in [Features & Changelog](./02-features-and-changelog.md) before or in the same change as the tag.

## Installation must be really easy — packaging requirements

| Platform | Format | Requirement |
|---|---|---|
| Windows | NSIS installer (`.exe`) | Per-user install by default (no admin prompt required); one-click through |
| macOS | `.dmg` | Signed **and notarized** — no Gatekeeper "unidentified developer" warning; drag-to-Applications |
| Linux | `.AppImage` + `.deb` (and `.rpm` if demand appears) | AppImage needs no install step at all; deb/rpm for users who prefer a package manager |

No installer should ever prompt for configuration, accounts, or license keys before the app opens.

## Updates must be really easy — auto-update requirements

- `electron-updater`, feed pointed at GitHub Releases (default; a dedicated update server is a future option if needed).
- Check on app launch and on an interval while running; download new versions in the background.
- Never interrupt the user mid-work — apply on next restart, with a small non-blocking "Update ready" affordance.
- Manual "Check for updates" menu entry as a fallback, never a requirement.
- A bad release must be revertible: keep the ability to unpublish/mark a GitHub Release as pre-release so the updater feed doesn't offer it, and re-tag a patch release promptly.

## Signing & secrets

`release.yml` already expects these as optional GitHub Actions secrets (build stays functional, just unsigned, if absent — but **do not ship an unsigned release to users**):

| Secret | Purpose |
|---|---|
| `CSC_LINK` / `CSC_KEY_PASSWORD` | macOS/Windows code-signing certificate |
| `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` / `APPLE_TEAM_ID` | macOS notarization |

Certificates and passwords live only in GitHub encrypted secrets — never in the repo, never in workflow logs.

## Environments & channels

- Single `stable` channel for now. A `beta`/pre-release channel is a reasonable future addition once there's a user base to stage rollouts to — not built until asked for.
- No server-side environments to manage yet: the product is a local desktop app with no required backend. If a backend appears later (e.g. for a licensing or sync feature), it gets its own page.

## Monitoring & maintenance

- Keep dependencies patched; treat `npm audit`/Dependabot alerts as real work (see [Security](./06-security.md)).
- Crash reporting / opt-in telemetry: not implemented yet — if added, it must be opt-in and disclosed in [User Guide](./03-user-guide.md)'s privacy section before shipping.
